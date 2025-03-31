#include "cjson/cJSON.h"
#include "dbg.h"
#include "minesweeper/minesweeper.h"
#include "rooms/rooms.h"
#include <arpa/inet.h>
#include <netinet/in.h>
#include <pthread.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#define MSG_SIZE 2048
#define PORT 5000

// NEED TO REVIEW THESE GLOBALS
int sd;
Room **rooms;
int curr_room_id;
int global_sd;
Room *curr_room;

void aborta_handler(int sig) {
  log_info("🔀  Server shutting down...");
  close(sd);
  exit(0);
}

void action_handler(int sig) {
  cJSON *res = cJSON_CreateObject();

  switch (curr_room->action) {
  case LOGIN: {
    log_info("User: '%s' joined you at room #%d", curr_room->game_2.username,
             curr_room_id);
    cJSON_AddStringToObject(res, "username", curr_room->game_2.username);
    cJSON_AddStringToObject(res, "type", "JOINED");

    char *map = map_to_string(curr_room->game_1.client_board);
    cJSON_AddStringToObject(res, "board", map);

    const char *json = cJSON_PrintUnformatted(res);
    send(curr_room->game_1.sd, json, strlen(json), 0);
    break;
  }
  case LOGOUT:
    break;
  case MOVE: {
    int player = determine_player(curr_room, getpid());
    Game *opponent = (player == 0) ? &curr_room->game_2 : &curr_room->game_1;

    cJSON *res = cJSON_CreateObject();
    cJSON_AddStringToObject(res, "type", "MOVE");
    cJSON_AddStringToObject(res, "player", opponent->username);
    cJSON_AddStringToObject(res, "board",
                            map_to_string(opponent->client_board));
    switch (opponent->status) {
    case ONGOING:
      cJSON_AddStringToObject(res, "status", "ONGOING");
      break;
    case VICTORY:
      cJSON_AddStringToObject(res, "status", "VICTORY");
      break;
    case DEFEAT:
      cJSON_AddStringToObject(res, "status", "DEFEAT");
      break;
    }
    cJSON_AddBoolToObject(res, "success", 1);

    const char *json = cJSON_PrintUnformatted(res);
    send(opponent->sd, json, strlen(json), 0);
    cJSON_Delete(res);
    free((void *)json);
    break;
  }
  default:
    break;
  }
}

void trim_newline(char *str) {
  int len = strlen(str);
  if (len > 0 && str[len - 1] == '\n')
    str[len - 1] = '\0';
  if (len > 1 && str[len - 2] == '\r')
    str[len - 2] = '\0';
}

int validate_user(char *username, char *password) {
  FILE *file = fopen("db.txt", "r");
  if (!file) {
    log_err("File does not exist or cannot be opened");
    return 0;
  }

  char line[256], file_user[128], file_pass[128];
  while (fgets(line, sizeof(line), file)) {
    sscanf(line, "%127s %127s", file_user, file_pass);
    if (strcmp(username, file_user) == 0 && strcmp(password, file_pass) == 0) {
      fclose(file);
      return 1;
    }
  }
  fclose(file);
  return 0;
}

int create_user(char *username, char *password) {
  if (validate_user(username, password)) {
    log_err("User '%s' already exists", username);
    return 0;
  }
  FILE *file = fopen("db.txt", "a");
  if (!file) {
    log_err("Could not open db.txt for writing");
    return 0;
  }
  fprintf(file, "%s %s\n", username, password);
  fclose(file);
  log_info("User '%s' created successfully", username);
  return 1;
}

struct client_info {
  int client_sd;
  struct sockaddr_in client_addr;
};

void handle_client(struct client_info info, Room **rooms) {
  int client_sd = info.client_sd;
  global_sd = info.client_sd;
  struct sockaddr_in client_addr = info.client_addr;

  char msg[MSG_SIZE];
  char authenticated_user[MSG_SIZE] = {0};
  cJSON *res = cJSON_CreateObject();
  const char *json;

  log_info("Accepted connection from %s:%d", inet_ntoa(client_addr.sin_addr),
           ntohs(client_addr.sin_port));

  while (1) {
    int bytes_received = recv(client_sd, msg, sizeof(msg) - 1, 0);
    if (bytes_received <= 0) {
      if (bytes_received == 0)
        log_info("Client disconnected");
      else
        perror("Receive failed");
      break;
    }

    msg[bytes_received] = '\0';
    trim_newline(msg);
    cJSON *root = cJSON_Parse(msg);
    if (!root) {
      log_err("Malformed request");
      send(client_sd, "ERROR: Invalid JSON\n", 23, 0);
      continue;
    }

    cJSON *type = cJSON_GetObjectItemCaseSensitive(root, "type");
    cJSON *username = cJSON_GetObjectItemCaseSensitive(root, "username");
    cJSON *password = cJSON_GetObjectItemCaseSensitive(root, "password");

    debug("%s", cJSON_Print(root));

    if (authenticated_user[0] == '\0' && cJSON_IsString(type) &&
        strcmp(type->valuestring, "LOGIN") == 0 && cJSON_IsString(username) &&
        cJSON_IsString(password)) {

      if (strcmp(type->valuestring, "LOGIN") == 0 &&
          validate_user(username->valuestring, password->valuestring)) {

        int room_id = -1;
        Room *room;
        strncpy(authenticated_user, username->valuestring,
                sizeof(authenticated_user) - 1);
        log_info("Authenticated user '%s'", authenticated_user);

        cJSON *new_room = cJSON_GetObjectItemCaseSensitive(root, "new_room");
        cJSON *new_room_id = cJSON_GetObjectItemCaseSensitive(root, "room_id");

        if (cJSON_IsBool(new_room) && cJSON_IsTrue(new_room)) {
          log_info("User trying to create new room");
          room_id = assign_room(rooms);
          if (room_id == -1) {
            log_err("No empty rooms found");
            cJSON_AddBoolToObject(res, "success", 0);
            json = cJSON_PrintUnformatted(res);
            send(client_sd, json, strlen(json), 0);
            cJSON_Delete(res);
            cJSON_Delete(root);
            continue;
          }
        } else if (cJSON_IsNumber(new_room_id)) {
          room_id = new_room_id->valueint;
          log_info("User trying to join room #%d", room_id);
        } else {
          log_err("Non valid room_id");
          cJSON_AddBoolToObject(res, "success", 0);
          json = cJSON_PrintUnformatted(res);
          send(client_sd, json, strlen(json), 0);
          cJSON_Delete(res);
          cJSON_Delete(root);
          continue;
        }

        room = rooms[room_id];
        int joined = try_join_room(room, getpid());

        if (joined != -1) {
          log_success("User '%s' joined room #%d as pid_%d", authenticated_user,
                      room_id, joined + 1);
          log_info("Room #%d: pid_1 = %d, pid_2 = %d", room_id, room->pid_1,
                   room->pid_2);

          cJSON_AddBoolToObject(res, "success", 1);
          cJSON_AddStringToObject(res, "type", "LOGIN");
          cJSON_AddStringToObject(res, "username", username->valuestring);
          cJSON_AddNumberToObject(res, "room_id", room_id);
          curr_room_id = room_id;
          curr_room = rooms[room_id];
          if (joined) {
            strncpy(curr_room->game_2.username, username->valuestring,
                    sizeof(curr_room->game_2.username) - 1);
            curr_room->game_2.sd = client_sd;

            kill(room->pid_1, SIGUSR1);
          } else {
            strncpy(curr_room->game_1.username, username->valuestring,
                    sizeof(curr_room->game_1.username) - 1);
            curr_room->game_1.sd = client_sd;
          }
        } else {
          log_err("Failed to join room #%d", room_id);
          cJSON_AddBoolToObject(res, "success", 0);
        }

        json = cJSON_PrintUnformatted(res);
        send(client_sd, json, strlen(json), 0);
        cJSON_Delete(res);
        cJSON_Delete(root);
        continue;
      }

      if (strcmp(msg, "close") == 0) {
        log_info("User '%s' requested to close", authenticated_user);
        break;
      }

      char response[MSG_SIZE + 64];
      snprintf(response, sizeof(response), "[%s] Echo: %s\n",
               authenticated_user, msg);
      send(client_sd, response, strlen(response), 0);
      cJSON_Delete(root);
    }

    if (authenticated_user[0] != '\0' && cJSON_IsString(type) &&
        strcmp(type->valuestring, "MOVE") == 0) {
      cJSON *x = cJSON_GetObjectItemCaseSensitive(root, "x");
      cJSON *y = cJSON_GetObjectItemCaseSensitive(root, "y");
      cJSON *action = cJSON_GetObjectItemCaseSensitive(root, "action");

      if (cJSON_IsNumber(x) && cJSON_IsNumber(y) && cJSON_IsString(action)) {
        BoardMove move = {.x = x->valueint,
                          .y = y->valueint,
                          .action = action->valuestring[0]};

        int player = determine_player(curr_room, getpid());
        Game *me = player == 0 ? &curr_room->game_1 : &curr_room->game_2;
        Game *opponent = player == 0 ? &curr_room->game_2 : &curr_room->game_1;

        me->status = process_move(me->server_board, me->client_board, move);
        curr_room->action = MOVE;

        // Send to other process
        kill((player == 0) ? curr_room->pid_2 : curr_room->pid_1, SIGUSR1);

        // Respond to sender
        cJSON *res = cJSON_CreateObject();
        cJSON_AddStringToObject(res, "type", "MOVE");
        cJSON_AddStringToObject(res, "player", me->username);
        cJSON_AddStringToObject(res, "board", map_to_string(me->client_board));
        cJSON_AddBoolToObject(res, "success", 1);

        switch (me->status) {
        case ONGOING:
          cJSON_AddStringToObject(res, "status", "ONGOING");
          break;
        case VICTORY:
          cJSON_AddStringToObject(res, "status", "VICTORY");
          break;
        case DEFEAT:
          cJSON_AddStringToObject(res, "status", "DEFEAT");
          break;
        }

        const char *json = cJSON_PrintUnformatted(res);
        send(client_sd, json, strlen(json), 0);
        cJSON_Delete(res);
        free((void *)json);
      }

      cJSON_Delete(root);
      continue;
    }

    if (strcmp(type->valuestring, "REGISTER") == 0) {
      if (create_user(username->valuestring, password->valuestring))
        send(client_sd, "REGISTERED\n", 11, 0);
      else
        send(client_sd, "REGISTRATION FAILED\n", 20, 0);
      cJSON_Delete(root);
      continue;
    }
  }

  close(client_sd);
  log_info("Child process %d (user '%s') exiting", getpid(),
           authenticated_user);
  exit(0);
}

int main() {
  if (signal(SIGINT, aborta_handler) == SIG_ERR) {
    perror("Could not set signal handler");
    return 1;
  }

  signal(SIGUSR1, action_handler);

  sd = socket(AF_INET, SOCK_STREAM, 0);
  if (sd == -1) {
    perror("Socket creation failed");
    return 1;
  }

  initialize_rooms(&rooms);

  struct sockaddr_in server_addr;
  server_addr.sin_family = AF_INET;
  server_addr.sin_port = htons(PORT);
  server_addr.sin_addr.s_addr = INADDR_ANY;

  if (bind(sd, (struct sockaddr *)&server_addr, sizeof(server_addr)) == -1) {
    perror("Bind failed");
    close(sd);
    return 1;
  }

  if (listen(sd, 5) == -1) {
    perror("Listen failed");
    close(sd);
    return 1;
  }

  log_info("Server is listening on port %d", PORT);

  while (1) {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_sd = accept(sd, (struct sockaddr *)&client_addr, &client_len);
    if (client_sd == -1) {
      perror("Accept failed");
      continue;
    }

    pid_t pid = fork();
    if (pid == 0) {
      close(sd);
      struct client_info info = {client_sd, client_addr};
      handle_client(info, rooms);
    } else if (pid > 0) {
      close(client_sd);
      log_info("Created child process %d for new connection", pid);
      while (waitpid(-1, NULL, WNOHANG) > 0)
        ;
    } else {
      perror("Fork failed");
      close(client_sd);
    }

    // Start background process that sends UDP messages every second
    pid_t udp_pid = fork();
    if (udp_pid == 0) {
      int udp_socket = socket(AF_INET, SOCK_DGRAM, 0);
      if (udp_socket < 0) {
        perror("UDP socket creation failed");
        exit(1);
      }

      struct sockaddr_in udp_addr;
      udp_addr.sin_family = AF_INET;
      udp_addr.sin_port = htons(5001); // <-- match your proxy's UDP bind port
      inet_pton(AF_INET, "127.0.0.1", &udp_addr.sin_addr); // send to proxy

      const char *msg = "{\"type\":\"MOVE\",\"success\":true,\"board\":\"\",\"player\":\"udp\",\"status\":\"ONGOING\"}";

      while (1) {
        sendto(udp_socket, msg, strlen(msg), 0, (struct sockaddr *)&udp_addr,
               sizeof(udp_addr));
        sleep(1);
      }

      close(udp_socket);
      exit(0); // exit child when loop is broken (shouldn't happen)
    }
  }

  close(sd);
  return 0;
}
