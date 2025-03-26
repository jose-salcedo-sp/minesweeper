#ifndef ROOMS_H
#define ROOMS_H

#include <pthread.h>
#include <sys/types.h>

#define MAX_ROOMS 1000

typedef char Board[64];

typedef struct {
  Board client_board;
  Board server_board;
} Game;

typedef struct {
  pthread_mutex_t lock;
  int pid_1;
  int pid_2;
  char user_1[15];
  char user_2[15];
  Game game_1;
  Game game_2;
} Room;

int assign_room(Room **rooms);
int try_join_room(Room *room, pid_t pid);

#endif
