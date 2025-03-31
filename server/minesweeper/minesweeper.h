#ifndef MINESWEEPER_H
#define MINESWEEPER_H

#define SIZE 8

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

typedef struct {
  char name[20];
  int room;
  int x;
  int y;
  char action;
} BoardMove;

typedef enum { VICTORY = 0, DEFEAT = 1, ONGOING = 2 } BoardStatus;

// Core functions
void generate_bomb_map(char bomb_map[SIZE][SIZE], char bomb_count);
void generate_unreveiled_map(char map[SIZE][SIZE]);

BoardStatus process_move(char bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE],
                         BoardMove move, int *revealed_count);
void reveal_empty_cells(char bomb_map[SIZE][SIZE], char game_map[SIZE][SIZE],
                        char x, char y, int *revealed_count);
char count_adjacent_bombs(char bomb_map[SIZE][SIZE], char x, char y);
char *map_to_string(char map[SIZE][SIZE]);
void flatten_map(char dest[SIZE * SIZE], char map[SIZE][SIZE]);

#endif // MINESWEEPER_H
