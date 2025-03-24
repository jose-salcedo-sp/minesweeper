#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/wait.h>

#define MSG_SIZE 2048
#define PORT 5000

int sd;

void aborta_handler(int sig) {
    printf("\nServer shutting down...\n");
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

void handle_client(int client_sd, struct sockaddr_in client_addr) {
    char msg[MSG_SIZE];
    
    printf("Child process %d handling client %s:%d\n", 
           getpid(), inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));
    
    while (1) {
        int bytes_received = recv(client_sd, msg, sizeof(msg), 0);
        if (bytes_received <= 0) {
            if (bytes_received == 0) {
                printf("Client %s:%d disconnected\n", 
                       inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));
            } else {
                perror("Receive failed");
            }
            break;
        }

        msg[bytes_received] = '\0';
        trim_newline(msg);
        printf("Received from client %s:%d: %s\n", 
               inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port), msg);

        if (strcmp(msg, "close") == 0) {
            printf("Client %s:%d requested to close\n", 
                   inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));
            break;
        }

        char response[MSG_SIZE + 10];
        snprintf(response, sizeof(response), "Message: %s", msg);
        
        if (send(client_sd, response, strlen(response), 0) == -1) {
            perror("Send failed");
            break;
        }
    }

    close(client_sd);
    printf("Child process %d exiting\n", getpid());
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

    if (bind(sd, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("Bind failed");
        close(sd);
        return 1;
    }

    if (listen(sd, 5) == -1) {
        perror("Listen failed");
        close(sd);
        return 1;
    }

    printf("Server is listening on port %d...\n", PORT);

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_sd = accept(sd, (struct sockaddr*)&client_addr, &client_len);
        
        if (client_sd == -1) {
            perror("Accept failed");
            continue;
        }

        pid_t pid = fork();
        if (pid == 0) { // Child process
            close(sd); // Close listening socket in child
            handle_client(client_sd, client_addr);
        } else if (pid > 0) { // Parent process
            close(client_sd); // Close client socket in parent
            printf("Created child process %d for new connection\n", pid);
            
            while (waitpid(-1, NULL, WNOHANG) > 0);
        } else {
            perror("Fork failed");
            close(client_sd);
        }
    }

    close(sd);
    return 0;
}
