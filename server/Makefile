CC = gcc
CFLAGS = -Wall -Wextra -pedantic -std=c99
INCLUDES = -Icjson
SRC = server.c cjson/cJSON.c
OBJ = $(SRC:.c=.o)
TARGET = server

all: $(TARGET)

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

clean:
	rm -f $(OBJ) $(TARGET)

