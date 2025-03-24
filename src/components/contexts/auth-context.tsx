import { Identifier } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "@tanstack/react-router";
import { createContext, useContext, useState } from "react";

type AuthContext = {
  name: string;
  login: (username: string, password: string, new_room: boolean) => Promise<void>;
  board: Identifier[][];
  updateBoard: (x: number, y: number, action: "r" | "f") => Promise<void>;
  flagsMarked: number;
  cellsDiscovered: number;
};

const default_board: Identifier[][] = [
  [1, "u", "u", "u", "u", "u", "u", "b"],
  [2, "u", "u", "u", "u", "u", "u", "u"],
  [3, "u", "u", "u", "u", "u", "u", "u"],
  [4, "u", "u", "u", "u", "u", "u", "u"],
  [5, "u", "u", "u", "u", "u", "u", "u"],
  [6, "u", "u", "u", "u", "u", "u", "u"],
  [7, "u", "u", "u", "u", "u", "u", "u"],
  [8, "u", "u", "u", "u", "u", "u", "u"],
];

const authContext = createContext<AuthContext>({
  name: "",
  board: default_board,
  login: () => {},
  updateBoard: async () => {},
  flagsMarked: 0,
  cellsDiscovered: 0,
});

// cliente: { name: 'pepe', room: 12345, x: 7, y: 7, action: 'f' }
//
// server: uu78f...
// ACTION { msg_type: 'ACTION', username: 'pepe', action: 'r', x: '5', y: '6' } -> { success: true | false, board: char[64], state: 'w' | 'd' | 'g' }
// LOGIN { msg_type: 'LOGIN', username: 'pepe', password: '12345', new_room: true | false } -> { success: true | false }
// REGISTER { msg_type: 'REGISTER', username: 'pepe', password: '12345' } -> { sucess: true | false }
type ACTION_HEADER = {
  username: string;
};

type MOVE = {
  type: "MOVE";
  action: "r" | "f";
  x: number;
  y: number;
} & ACTION_HEADER;

type LOGIN = {
  type: "LOGIN";
  password: string;
  new_room: boolean;
  room_id?: number;
} & ACTION_HEADER;

type REGISTER = {
  type: "REGISTER";
  password: string;
} & ACTION_HEADER;

export type ACTIONS = MOVE | LOGIN | REGISTER;

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [board, setBoard] = useState<Identifier[][]>(() =>
    default_board.map((row) => [...row]),
  );
  const [flagsMarked, setFlagsMarked] = useState(0);
  const [cellsDiscovered, setCellsDiscovered] = useState(0);

  async function updateBoard(x: number, y: number, action: "f" | "r") {
  }

  const loginMutation = useMutation({
    mutationFn: (action: LOGIN) => {
      return fetch("http://localhost:3001/api/tcp", { method: "POST", body: JSON.stringify(action) });
    },
  });

  async function login(username: string, password: string, new_room: boolean) {
    try {
        const a = await loginMutation.mutateAsync({
            type: 'LOGIN',
            password,
            username,
            new_room,
        });

        console.log(a);
    } catch (err) {
        console.error(err);
    }
  }

  return (
    <authContext.Provider
      value={{ name, login, board, updateBoard, flagsMarked, cellsDiscovered }}
    >
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
