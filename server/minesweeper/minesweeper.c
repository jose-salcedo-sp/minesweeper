#include "minesweeper.h"
#define SIZE 8

void generate_bomb_map(char bomb_map[SIZE][SIZE], char bomb_count) {
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

void generate_unreveiled_map(char map[SIZE][SIZE]) {
  memset(map, 'u', SIZE * SIZE * sizeof(char));
}

char count_adjacent_bombs(char bomb_map[SIZE][SIZE], char x, char y) {
  int count = 0;
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      int new_x = x + i;
      int new_y = y + j;
      if (new_x >= 0 && new_x < SIZE && new_y >= 0 && new_y < SIZE &&
          bomb_map[new_x][new_y] == 1) {
        count++;
      }
    }
  }
  return count;
}

void reveal_empty_cells(char bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE],
                        char x, char y) {
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

BoardStatus process_move(char bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE],
                         BoardMove move) {
  int x = move.x;
  int y = move.y;

  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) {
    return ONGOING;
  }

  if (move.action == 'r') {
    if (bomb_map[x][y] == 1) {
      return DEFEAT;
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
    return VICTORY;
  }

  return ONGOING;
}

char *map_to_string(char map[SIZE][SIZE]) {
  char *result = (char *)malloc((SIZE * SIZE + 1) * sizeof(char));
  int index = 0;

  for (int i = 0; i < SIZE; i++) {
    for (int j = 0; j < SIZE; j++) {
      char c = map[i][j];
      char visual =
          (c == 1) ? '*' : (c == 0 ? '.' : c); // convert bomb=*, empty=.
      result[index++] = visual;
    }
    printf("\n");
  }
  result[index] = '\0';
  return result;
}
