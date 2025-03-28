#include "rooms.h"

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

void initialize_rooms(Room ***rooms) {
  *rooms = mmap(NULL, sizeof(Room *) * MAX_ROOMS, PROT_READ | PROT_WRITE,
                MAP_SHARED | MAP_ANONYMOUS, -1, 0);

  for (int i = 0; i < MAX_ROOMS; i++) {
    (*rooms)[i] = mmap(NULL, sizeof(Room), PROT_READ | PROT_WRITE,
                       MAP_SHARED | MAP_ANONYMOUS, -1, 0);

    pthread_mutexattr_t attr;
    pthread_mutexattr_init(&attr);
    pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);
    pthread_mutex_init(&((*rooms)[i]->lock), &attr);

    (*rooms)[i]->pid_1 = -1;
    (*rooms)[i]->pid_2 = -1;
  }
}
