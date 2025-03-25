#include "cjson/cJSON.h"
#include <arpa/inet.h>
#include <netinet/in.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

#define MSG_SIZE 2048
#define PORT 5000

#define SERVER_LOG(type, fmt, ...)                                             \
  do {                                                                         \
    if (strcmp(type, "start") == 0)                                            \
      printf("🛠  " fmt "...\n", ##__VA_ARGS__);                                \
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

typedef struct {
  const char *username;
  const char *password;
} User;

int validate_user(char *username, char *password) {
  FILE *file;
  char filename[] = "db.txt";

  file = fopen(filename, "r");

  if (file == NULL) {
    SERVER_LOG("error", "File does not exist or cannot be opened");
    return 0;
  } else {
    SERVER_LOG("success", "File opened successfully");
    char line[256];
    char file_user[128], file_pass[128];

    while (fgets(line, sizeof(line), file)) {
      line[strcspn(line, "\r\n")] = 0;
      int parsed = sscanf(line, "%127s %127s", file_user, file_pass);

      if (parsed == 2) {
        if (strcmp(username, file_user) == 0 &&
            strcmp(password, file_pass) == 0) {
          fclose(file);
          return 1; // ✅ User found
        }
      }
    }

    fclose(file);
  }

  return 0; // ❌ Not found
}

int create_user(char *username, char *password) {
  // First, check if user already exists
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

void handle_client(int client_sd, struct sockaddr_in client_addr) {
  char msg[MSG_SIZE];
  char authenticated_user[MSG_SIZE] = {0};

  SERVER_LOG("success", "Accepted connection from %s:%d",
             inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

  while (1) {
    int bytes_received = recv(client_sd, msg, sizeof(msg) - 1, 0);
    if (bytes_received <= 0) {
      if (bytes_received == 0) {
        SERVER_LOG("success", "Client disconnected");
      } else {
        perror("Receive failed");
      }
      break;
    }

    msg[bytes_received] = '\0';
    trim_newline(msg);

    cJSON *root = cJSON_Parse(msg);

    if (!root) {
      SERVER_LOG("error", "Malformed request");
      send(client_sd, "ERROR: Invalid LOGIN payload\n", 30, 0);
      continue;
    }

    cJSON *type = cJSON_GetObjectItemCaseSensitive(root, "type");

    if (authenticated_user[0] == '\0') {
      cJSON *username = cJSON_GetObjectItemCaseSensitive(root, "username");
      cJSON *password = cJSON_GetObjectItemCaseSensitive(root, "password");

      if (cJSON_IsString(type) && strcmp(type->valuestring, "LOGIN") == 0 &&
          cJSON_IsString(username) && cJSON_IsString(password)) {

        if (validate_user(username->valuestring, password->valuestring)) {
          strncpy(authenticated_user, username->valuestring,
                  sizeof(authenticated_user) - 1);
          SERVER_LOG("success", "Authenticated user '%s'", authenticated_user);
          send(client_sd, "LOGIN OK", 9, 0);
        } else {
          SERVER_LOG("error", "Invalid credentials for '%s'",
                     username->valuestring);
          send(client_sd, "LOGIN FAILED", 13, 0);
        }
      } else if (cJSON_IsString(type) &&
                 strcmp(type->valuestring, "REGISTER") == 0 &&
                 cJSON_IsString(username) && cJSON_IsString(password)) {
        if (create_user(username->valuestring, password->valuestring)) {
          send(client_sd, "REGISTERED", 11, 0);
        } else {
          send(client_sd, "REGISTRATION FAILED", 20, 0);
        }
      }

      cJSON_Delete(root);
    } else {
      send(client_sd, "ERROR: Malformed JSON", 23, 0);
    }

    // Authenticated commands
    if (strcmp(msg, "close") == 0) {
      SERVER_LOG("info", "User '%s' requested to close", authenticated_user);
      break;
    }

    char response[MSG_SIZE + 64];
    snprintf(response, sizeof(response), "[%s] Echo: %s\n", authenticated_user,
             msg);

    if (send(client_sd, response, strlen(response), 0) == -1) {
      perror("Send failed");
      break;
    }
  }

  close(client_sd);
  SERVER_LOG("success", "Child process %d (user '%s') exiting", getpid(),
             authenticated_user);
  exit(0);
}

int main() {
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

  while (1) {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_sd = accept(sd, (struct sockaddr *)&client_addr, &client_len);

    if (client_sd == -1) {
      perror("Accept failed");
      continue;
    }

    pid_t pid = fork();
    if (pid == 0) { // Child process
      close(sd);    // Close listening socket in child
      handle_client(client_sd, client_addr);
    } else if (pid > 0) { // Parent process
      close(client_sd);   // Close client socket in parent
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
