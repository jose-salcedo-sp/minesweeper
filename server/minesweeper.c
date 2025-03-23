#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define SIZE 8

typedef struct {
    char name[20];
    int room;
    int x;
    int y;
    char action;
} Move;

void generate_bomb_map(int bomb_map[SIZE][SIZE], int bomb_count);
void print_map(char map[SIZE][SIZE]);
void print_bomb_map(int map[SIZE][SIZE]);
char* process_move(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], Move move);
int count_adjacent_bombs(int bomb_map[SIZE][SIZE], int x, int y);
char* map_to_string(char map[SIZE][SIZE]);
void reveal_empty_cells(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], int x, int y);

int main() {
    int bomb_map[SIZE][SIZE];
    char game_map[SIZE][SIZE];

    memset(game_map, 'u', SIZE * SIZE * sizeof(char));

    generate_bomb_map(bomb_map, 10);

    printf("Bomb Map:\n");
    print_bomb_map(bomb_map);

    while (1) {
        printf("Current Game Map:\n");
        print_map(game_map);

        Move move;
        printf("Enter your move (x y action): ");
        scanf("%d %d %c", &move.x, &move.y, &move.action);

        char* result = process_move(bomb_map, game_map, move);
        printf("Result: %s\n", result);

        if (strcmp(result, "Defeat") == 0 || strcmp(result, "Victory") == 0) {
            printf("Game Over!\n");
            break;
        }

        free(result);
    }

    return 0;
}

void generate_bomb_map(int bomb_map[SIZE][SIZE], int bomb_count) {
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            bomb_map[i][j] = 0;
        }
    }

    srand(time(NULL));

    int bombs_placed = 0;
    while (bombs_placed < bomb_count) {
        int x = rand() % SIZE;
        int y = rand() % SIZE;
        if (bomb_map[x][y] == 0) {
            bomb_map[x][y] = 1;
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

void reveal_empty_cells(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], int x, int y) {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || game_map[x][y] != 'u') {
        return;
    }

    int adjacent_bombs = count_adjacent_bombs(bomb_map, x, y);

    if (adjacent_bombs == 0) {
        game_map[x][y] = 'e';
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                if (i != 0 || j != 0) {
                    reveal_empty_cells(bomb_map, game_map, x + i, y + j);
                }
            }
        }
    } else {
        game_map[x][y] = '0' + adjacent_bombs;
    }
}

char* process_move(int bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE], Move move) {
    int x = move.x;
    int y = move.y;

    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
        return "Invalid move";
    }

    if (move.action == 'r') {
        if (bomb_map[x][y] == 1) {
            return "Defeat";
        } else {
            reveal_empty_cells(bomb_map, game_map, x, y);
        }
    }

    if (move.action == 'f') {
        game_map[x][y] = 'f';
    }

    int unrevealed_count = 0;
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            if (game_map[i][j] == 'u' && bomb_map[i][j] == 0) {
                unrevealed_count++;
            }
        }
    }
    if (unrevealed_count == 0) {
        return "Victory";
    }

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
    result[index] = '\0';
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
