#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define MSG_SIZE 2048
#define PORT 5000

int sd; // Socket descriptor

// Signal handler for graceful shutdown
void aborta_handler(int sig) {
    printf("\nServer shutting down...\n");
    close(sd);
    exit(0);
}

// Function to trim newline characters from a string
void trim_newline(char *str) {
    int len = strlen(str);
    if (len > 0 && str[len - 1] == '\n') {
        str[len - 1] = '\0';
    }
    if (len > 1 && str[len - 2] == '\r') {
        str[len - 2] = '\0';
    }
}

int main() {
    // Set up signal handler for Ctrl+C (SIGINT)
    if (signal(SIGINT, aborta_handler) == SIG_ERR) {
        perror("Could not set signal handler");
        return 1;
    }

    // Create a TCP socket
    if ((sd = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
        perror("Socket creation failed");
        return 1;
    }

    // Define server address
    struct sockaddr_in server_addr;
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT); // Port number
    server_addr.sin_addr.s_addr = INADDR_ANY; // Listen on all interfaces

    // Bind the socket to the address
    if (bind(sd, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
        perror("Bind failed");
        close(sd);
        return 1;
    }

    // Listen for incoming connections
    if (listen(sd, 5) == -1) { // Backlog of 5
        perror("Listen failed");
        close(sd);
        return 1;
    }

    printf("Server is listening on port %d...\n", PORT);

    // Accept a client connection
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_sd = accept(sd, (struct sockaddr*)&client_addr, &client_len);
    if (client_sd == -1) {
        perror("Accept failed");
        close(sd);
        return 1;
    }

    printf("Client connected from %s:%d\n", inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

    char msg[MSG_SIZE];
    while (1) {
        // Receive a message from the client
        int bytes_received = recv(client_sd, msg, sizeof(msg), 0);
        if (bytes_received == -1) {
            perror("Receive failed");
            break;
        } else if (bytes_received == 0) {
            printf("Client disconnected\n");
            break;
        }

        msg[bytes_received] = '\0'; // Null-terminate the received message
        trim_newline(msg); // Trim newline characters
        printf("Received from client: %s\n", msg);

        // Check if the client sent "close"
        if (strcmp(msg, "close") == 0) {
            printf("Client requested to close the connection\n");
            break;
        }

        // Prepare the response: "Message: " + received message
        char response[MSG_SIZE + 10]; // Extra space for "Message: "
        snprintf(response, sizeof(response), "Message: %s", msg);

        // Send the response back to the client
        if (send(client_sd, response, strlen(response), 0) == -1) {
            perror("Send failed");
            break;
        }
        printf("Sent to client: %s\n", response);
    }

    // Close the client socket
    close(client_sd);
    printf("Client connection closed\n");

    // Close the server socket
    close(sd);
    printf("Server shutdown complete\n");

    return 0;
}
