import { Identifier } from "@/types";
import { ReactNode } from "@tanstack/react-router";
import { createContext, useContext, useState } from "react";

type AuthContext = {
  name: string;
  login: (username: string) => void;
  board: Identifier[][];
  updateBoard: (x: number, y: number, action: "r" | "f") => Promise<void>;
};

const default_board: Identifier[][] = [
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
  ["u", "u", "u", "u", "u", "u", "u", "u"],
];

const authContext = createContext<AuthContext>({
  name: "",
  board: default_board,
  login: () => {},
  updateBoard: async () => {},
});

// cliente: { name: 'pepe', room: 12345, x: 7, y: 7, action: 'f' }
//
// server: uu78f...

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [board, setBoard] = useState<Identifier[][]>(() =>
    default_board.map((row) => [...row]),
  );

  async function updateBoard(x: number, y: number, action: "f" | "r") {
    const new_board = board.map((row) => [...row.map((cell) => cell)]);

    new_board[y][x] = action === "r" ? "e" : "f";
    setBoard(new_board);
  }

  async function login() {
      const res = await (await fetch("http://localhost:3001/api/tcp")).json();

      console.log(res);
  }

  return (
    <authContext.Provider value={{ name, login, board, updateBoard }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
