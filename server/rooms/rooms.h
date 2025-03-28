#ifndef ROOMS_H
#define ROOMS_H

#include <pthread.h>
#include <sys/types.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include "../minesweeper/minesweeper.h"

#define MAX_ROOMS 1000

typedef char Board[SIZE][SIZE];

typedef enum Actions {
    LOGIN = 0,
    MOVE = 1,
    LOGOUT = 2
} Actions;

typedef struct {
  Board client_board;
  Board server_board;
} Game;

typedef struct {
    char username[15];
    Game game;
    char active;
    int sd;
} UserState;

typedef struct {
  pthread_mutex_t lock;
  int pid_1;
  int pid_2;
  UserState user_1;
  UserState user_2;
  Actions action;
} Room;

int assign_room(Room **rooms);
int try_join_room(Room *room, pid_t pid);
void initialize_rooms(Room ***rooms);
void game_initialization(Game *game);
void set_room_defaults(Room *room);

#endif
