# Compiler and flags
CC       = gcc
CFLAGS   = -Wall -Wextra -pedantic -std=c99 -D_GNU_SOURCE
INCLUDES = -I. -Icjson -Irooms -Iminesweeper

# Target executable
TARGET   = server

# Object files
OBJS     = cjson/cJSON.o rooms/rooms.o minesweeper/minesweeper.o server.o

.PHONY: all clean

all: $(TARGET)

# Link the final executable
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) $(OBJS) -o $(TARGET)

# Compile cJSON
cjson/cJSON.o: cjson/cJSON.c cjson/cJSON.h
	$(CC) $(CFLAGS) $(INCLUDES) -c cjson/cJSON.c -o cjson/cJSON.o

# Compile rooms
rooms/rooms.o: rooms/rooms.c rooms/rooms.h
	$(CC) $(CFLAGS) $(INCLUDES) -c rooms/rooms.c -o rooms/rooms.o

# Compile minesweeper
minesweeper/minesweeper.o: minesweeper/minesweeper.c minesweeper/minesweeper.h
	$(CC) $(CFLAGS) $(INCLUDES) -c minesweeper/minesweeper.c -o minesweeper/minesweeper.o

# Compile server
server.o: server.c cjson/cJSON.h rooms/rooms.h dbg.h
	$(CC) $(CFLAGS) $(INCLUDES) -c server.c -o server.o

# Clean up build artifacts
clean:
	rm -f $(OBJS) $(TARGET)
