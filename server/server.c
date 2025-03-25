#include "cjson/cJSON.h"
#include "rooms/rooms.h"
#include <arpa/inet.h>
#include <iso646.h>
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

Room **rooms;

#define SERVER_LOG(type, fmt, ...)                                             \
  do {                                                                         \
    if (strcmp(type, "start") == 0)                                            \
      printf("🔀  " fmt "...\n", ##__VA_ARGS__);                               \
    else if (strcmp(type, "success") == 0)                                     \
      printf("✅  " fmt "\n", ##__VA_ARGS__);                                  \
    else if (strcmp(type, "error") == 0)                                       \
      fprintf(stderr, "❌  " fmt "\n", ##__VA_ARGS__);                         \
    else                                                                       \
      printf("ℹ️  " fmt "\n", ##__VA_ARGS__);                                   \
  } while (0)

int sd;

void aborta_handler(int sig) {
  SERVER_LOG("start", "Server shutting down");
  close(sd);
  exit(0);
}

void trim_newline(char *str) {
  int len = strlen(str);
  if (len > 0 && str[len - 1] == '\n') {
    str[len - 1] = '\0';
  }
  if (len > 1 && str[len - 2] == '\r') {
    str[len - 2] = '\0';
  }
}

int validate_user(char *username, char *password) {
  FILE *file;
  char filename[] = "db.txt";

  file = fopen(filename, "r");
  if (file == NULL) {
    SERVER_LOG("error", "File does not exist or cannot be opened");
    return 0;
  }

  char line[256], file_user[128], file_pass[128];
  while (fgets(line, sizeof(line), file)) {
    line[strcspn(line, "\r\n")] = 0;
    int parsed = sscanf(line, "%127s %127s", file_user, file_pass);
    if (parsed == 2 && strcmp(username, file_user) == 0 &&
        strcmp(password, file_pass) == 0) {
      fclose(file);
      return 1;
    }
  }

  fclose(file);
  return 0;
}

int create_user(char *username, char *password) {
  if (validate_user(username, password)) {
    SERVER_LOG("error", "User '%s' already exists", username);
    return 0;
  }

  FILE *file = fopen("db.txt", "a");
  if (file == NULL) {
    SERVER_LOG("error", "Could not open db.txt for writing");
    return 0;
  }

  fprintf(file, "%s %s\n", username, password);
  fclose(file);
  SERVER_LOG("success", "User '%s' created successfully", username);
  return 1;
}

// Shared between parent and child
struct client_info {
  int client_sd;
  struct sockaddr_in client_addr;
  int room_id;
};

void handle_client(struct client_info info, Room **rooms) {
  int client_sd = info.client_sd;
  struct sockaddr_in client_addr = info.client_addr;
  int room_id = info.room_id;
  Room *room = rooms[room_id];
  char msg[MSG_SIZE];
  char authenticated_user[MSG_SIZE] = {0};

  SERVER_LOG("success", "Accepted connection from %s:%d",
             inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

  while (1) {
    int bytes_received = recv(client_sd, msg, sizeof(msg) - 1, 0);
    if (bytes_received <= 0) {
      if (bytes_received == 0)
        SERVER_LOG("success", "Client disconnected");
      else
        perror("Receive failed");
      break;
    }

    msg[bytes_received] = '\0';
    trim_newline(msg);
    cJSON *root = cJSON_Parse(msg);
    if (!root) {
      SERVER_LOG("error", "Malformed request");
      send(client_sd, "ERROR: Invalid JSON\n", 23, 0);
      continue;
    }

    cJSON *type = cJSON_GetObjectItemCaseSensitive(root, "type");
    cJSON *username = cJSON_GetObjectItemCaseSensitive(root, "username");
    cJSON *password = cJSON_GetObjectItemCaseSensitive(root, "password");

    if (authenticated_user[0] == '\0' && cJSON_IsString(type) &&
        cJSON_IsString(username) && cJSON_IsString(password)) {

      if (strcmp(type->valuestring, "LOGIN") == 0 &&
          validate_user(username->valuestring, password->valuestring)) {

        strncpy(authenticated_user, username->valuestring,
                sizeof(authenticated_user) - 1);
        SERVER_LOG("success", "Authenticated user '%s'", authenticated_user);

        int joined = try_join_room(room, getpid());

        cJSON *res = cJSON_CreateObject();
        if (joined != -1) {
          SERVER_LOG("success", "User '%s' joined room #%d as pid_%d",
                     authenticated_user, room_id, joined + 1);
          SERVER_LOG("info", "Room #%d: pid_1 = %d, pid_2 = %d", room_id,
                     room->pid_1, room->pid_2);
          cJSON_AddBoolToObject(res, "success", 1);
          cJSON_AddNumberToObject(res, "room_id", room_id);
        } else {
          SERVER_LOG("error", "Failed to join room #%d", room_id);
          cJSON_AddBoolToObject(res, "success", 0);
        }

        const char *json = cJSON_PrintUnformatted(res);
        send(client_sd, json, strlen(json), 0);
        cJSON_Delete(res);
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

    if (strcmp(msg, "close") == 0) {
      SERVER_LOG("info", "User '%s' requested to close", authenticated_user);
      break;
    }

    char response[MSG_SIZE + 64];
    snprintf(response, sizeof(response), "[%s] Echo: %s\n", authenticated_user,
             msg);
    send(client_sd, response, strlen(response), 0);
    cJSON_Delete(root);
  }

  close(client_sd);
  SERVER_LOG("success", "Child process %d (user '%s') exiting", getpid(),
             authenticated_user);
  exit(0);
}

int main() {
  rooms = mmap(NULL, sizeof(Room *) * MAX_ROOMS, PROT_READ | PROT_WRITE,
               MAP_SHARED | MAP_ANONYMOUS, -1, 0);

  if (rooms == MAP_FAILED) {
    perror("mmap for rooms array failed");
    exit(1);
  }

  memset(rooms, 0, sizeof(Room *) * MAX_ROOMS);

  if (signal(SIGINT, aborta_handler) == SIG_ERR) {
    perror("Could not set signal handler");
    return 1;
  }

  if ((sd = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
    perror("Socket creation failed");
    return 1;
  }

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

  SERVER_LOG("success", "Server is listening on port %d", PORT);

  // Temporary: always use room 0 for testing
  int room_id = 0;
  rooms[room_id] = create_room();

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
      struct client_info info = {.client_sd = client_sd,
                                 .client_addr = client_addr,
                                 .room_id = room_id};
      handle_client(info, rooms);
    } else if (pid > 0) {
      close(client_sd);
      SERVER_LOG("info", "Created child process %d for new connection", pid);
      while (waitpid(-1, NULL, WNOHANG) > 0)
        ;
    } else {
      perror("Fork failed");
      close(client_sd);
    }
  }

  close(sd);
  return 0;
}
