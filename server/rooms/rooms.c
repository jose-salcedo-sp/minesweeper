#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/wait.h>
#include <unistd.h>

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
  Game game_1;
  Game game_2;
} Room;

Room *rooms[MAX_ROOMS];

Room *create_room() {
  Room *room = mmap(NULL, sizeof(Room), PROT_READ | PROT_WRITE,
                    MAP_SHARED | MAP_ANONYMOUS, -1, 0);

  if (room == MAP_FAILED) {
    perror("mmap failed");
    exit(1);
  }

  pthread_mutexattr_t attr;
  pthread_mutexattr_init(&attr);
  pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);

  if (pthread_mutex_init(&room->lock, &attr) != 0) {
    perror("pthread_mutex_init failed");
    exit(1);
  }

  room->pid_1 = -1;
  room->pid_2 = -1;

  return room;
}

void destroy_room(Room *room) {
  pthread_mutex_destroy(&room->lock);
  munmap(room, sizeof(Room));
}

int assign_room() {
  int i = 0;
  while (rooms[i] != NULL && i < MAX_ROOMS)
    i++; // find empty room
  if (i >= MAX_ROOMS)
    return -1; // no empty rooms, operation unsuccessful
  rooms[i] = create_room();   // assign pointer to room
  rooms[i]->pid_1 = getpid(); // assign user pid

  return i;
}

int try_join_room(Room *room, pid_t pid) {
  int result = -1; // -1 = can't join, 0 = joined as pid_1, 1 = joined as pid_2

  pthread_mutex_lock(&room->lock);

  if (room->pid_1 == -1) {
    room->pid_1 = pid;
    result = 0;
  } else if (room->pid_2 == -1) {
    room->pid_2 = pid;
    result = 1;
  }

  pthread_mutex_unlock(&room->lock);
  return result;
}
