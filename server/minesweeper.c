#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define SIZE 8

// Structure to represent a client move
typedef struct {
    char name[20];
    int room;
    int x;
    int y;
    char action; // 'f' for flag, 'r' for reveal
} Move;

// Function prototypes
void generate_bomb_map(int bomb_map[SIZE][SIZE], int bomb_count);
void print_map(char map[SIZE][SIZE]);
void print_bomb_map(int map[SIZE][SIZE]);
char* process_move(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], Move move);
int count_adjacent_bombs(int bomb_map[SIZE][SIZE], int x, int y);
char* map_to_string(char map[SIZE][SIZE]);

int main() {
    int bomb_map[SIZE][SIZE];
    char game_map[SIZE][SIZE];

    // Initialize game_map with 'u' (unrevealed)
    memset(game_map, 'u', SIZE * SIZE * sizeof(char));

    // Generate bomb map with 10 bombs
    generate_bomb_map(bomb_map, 10);

    // Print bomb map for debugging
    printf("Bomb Map:\n");
    print_bomb_map(bomb_map);

    // Simulate client moves
    Move move1 = {"Player1", 1234, 3, 4, 'r'}; // Reveal cell (3, 4)
    char* result1 = process_move(bomb_map, game_map, move1);
    printf("Result 1: %s\n", result1);
    printf("Game Map:\n");
    print_map(game_map);

    Move move2 = {"Player1", 1234, 0, 0, 'r'}; // Reveal cell (0, 0)
    char* result2 = process_move(bomb_map, game_map, move2);
    printf("Result 2: %s\n", result2);
    printf("Game Map:\n");
    print_map(game_map);

    // Free allocated memory
    free(result1);
    free(result2);

    return 0;
}

void generate_bomb_map(int bomb_map[SIZE][SIZE], int bomb_count) {
    // Initialize bomb_map with 0 (no bombs)
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            bomb_map[i][j] = 0;
        }
    }

    // Seed the random number generator
    srand(time(NULL));

    // Place bombs randomly
    int bombs_placed = 0;
    while (bombs_placed < bomb_count) {
        int x = rand() % SIZE;
        int y = rand() % SIZE;
        if (bomb_map[x][y] == 0) {
            bomb_map[x][y] = 1; // Place a bomb
            bombs_placed++;
        }
    }
}

int count_adjacent_bombs(int bomb_map[SIZE][SIZE], int x, int y) {
    int count = 0;
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            int new_x = x + i;
            int new_y = y + j;
            if (new_x >= 0 && new_x < SIZE && new_y >= 0 && new_y < SIZE && bomb_map[new_x][new_y] == 1) {
                count++;
            }
        }
    }
    return count;
}

char* process_move(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], Move move) {
    int x = move.x;
    int y = move.y;

    // Check if the move is valid
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
        return "Invalid move";
    }

    // Handle reveal action
    if (move.action == 'r') {
        if (bomb_map[x][y] == 1) {
            return "Defeat"; // Player revealed a bomb
        } else {
            int adjacent_bombs = count_adjacent_bombs(bomb_map, x, y);
            game_map[x][y] = (adjacent_bombs == 0) ? 'r' : ('0' + adjacent_bombs);
        }
    }

    // Handle flag action
    if (move.action == 'f') {
        game_map[x][y] = 'f'; // Flag the cell
    }

    // Check for victory
    int unrevealed_count = 0;
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            if (game_map[i][j] == 'u' && bomb_map[i][j] == 0) {
                unrevealed_count++;
            }
        }
    }
    if (unrevealed_count == 0) {
        return "Victory"; // All non-bomb cells are revealed
    }

    // Return the updated game map as a linear string
    return map_to_string(game_map);
}

char* map_to_string(char map[SIZE][SIZE]) {
    char* result = (char*)malloc((SIZE * SIZE + 1) * sizeof(char));
    int index = 0;
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            result[index++] = map[i][j];
        }
    }
    result[index] = '\0'; // Null-terminate the string
    return result;
}

void print_map(char map[SIZE][SIZE]) {
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            printf("%c ", map[i][j]);
        }
        printf("\n");
    }
}


void print_bomb_map(int map[SIZE][SIZE]) {
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            printf("%d ", map[i][j]);
        }
        printf("\n");
    }
}
