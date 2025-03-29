#ifndef ROOMS_H
#define ROOMS_H

#include "../minesweeper/minesweeper.h"
#include <pthread.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <string.h>

#define MAX_ROOMS 1000

typedef char Board[SIZE][SIZE];

typedef enum Actions { LOGIN = 0, MOVE = 1, LOGOUT = 2 } Actions;

typedef struct {
  Board client_board;
  Board server_board;
  char username[15];
  int sd;
} Game;

typedef struct {
  pthread_mutex_t lock;
  int pid_1;
  int pid_2;
  Game game_1;
  Game game_2;
  Actions action;
} Room;

int assign_room(Room **rooms);
int try_join_room(Room *room, pid_t pid);
void initialize_rooms(Room ***rooms);

#endif
