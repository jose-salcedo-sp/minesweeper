#include "rooms.h"
#include "../minesweeper/minesweeper.h"

void initialize_rooms(Room ***rooms_ptr) {
  *rooms_ptr = mmap(NULL, sizeof(Room *) * MAX_ROOMS, PROT_READ | PROT_WRITE,
                    MAP_SHARED | MAP_ANONYMOUS, -1, 0);
  if (*rooms_ptr == MAP_FAILED) {
    perror("mmap failed for room array");
    exit(1);
  }

  for (int i = 0; i < MAX_ROOMS; i++) {
    (*rooms_ptr)[i] = mmap(NULL, sizeof(Room), PROT_READ | PROT_WRITE,
                           MAP_SHARED | MAP_ANONYMOUS, -1, 0);

    if ((*rooms_ptr)[i] == MAP_FAILED) {
      perror("mmap failed for room");
      exit(1);
    }

    pthread_mutexattr_t attr;
    pthread_mutexattr_init(&attr);
    pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);

    if (pthread_mutex_init(&(*rooms_ptr)[i]->lock, &attr) != 0) {
      perror("pthread_mutex_init failed");
      exit(1);
    }

    set_room_defaults((*rooms_ptr)[i]);
  }
}

void set_room_defaults(Room *room) {
  room->user_1.active = 0;
  room->user_2.active = 0;
  game_initialization(&room->user_1.game);
  game_initialization(&room->user_2.game);

  room->pid_1 = -1;
  room->pid_2 = -1;
}

void game_initialization(Game *game) {
  generate_bomb_map(game->server_board, SIZE);
  generate_unreveiled_map(game->client_board);
}

int assign_room(Room **rooms) {
  for (int i = 0; i < MAX_ROOMS; i++) {
    if (rooms[i]->pid_1 == -1 && rooms[i]->pid_2 == -1)
      return i;
  }
  return -1;
}

int try_join_room(Room *room, pid_t pid) {
  int result = -1;

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
