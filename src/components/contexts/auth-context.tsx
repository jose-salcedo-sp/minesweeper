import { Identifier } from "@/types";
import { ReactNode } from "@tanstack/react-router";
import { createContext, useContext, useState } from "react";

type AuthContext = {
  name: string;
  login: (username: string) => void;
  board: Identifier[][];
  updateBoard: (x: number, y: number, action: "r" | "f") => Promise<void>;
  flagsMarked: number;
  cellsDiscovered: number;
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
  flagsMarked: 0,
  cellsDiscovered: 0,
});

// cliente: { name: 'pepe', room: 12345, x: 7, y: 7, action: 'f' }
//
// server: uu78f...

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("");
  const [board, setBoard] = useState<Identifier[][]>(() =>
    default_board.map((row) => [...row]),
  );
  const [flagsMarked, setFlagsMarked] = useState(0);
  const [cellsDiscovered, setCellsDiscovered] = useState(0);

  async function updateBoard(x: number, y: number, action: "f" | "r") {
    const prevState = board[y][x];
    const new_board = board.map((row) => [...row]);

    if (action === "r") {  // Reveal action
      if (prevState === "f") setFlagsMarked(prev => prev - 1);
      if (prevState !== "e") setCellsDiscovered(prev => prev + 1);
      new_board[y][x] = "e";
    } 
    else {  // Flag action
      if (prevState === "u") {
        new_board[y][x] = "f";
        setFlagsMarked(prev => prev + 1);
      } else if (prevState === "f") {
        new_board[y][x] = "u";
        setFlagsMarked(prev => prev - 1);
      }
    }

    setBoard(new_board);
  }

  async function login() {
      const res = await (await fetch("http://localhost:3001/api/tcp")).json();

      console.log(res);
  }

  return (
    <authContext.Provider value={{ name, login, board, updateBoard, flagsMarked, cellsDiscovered }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
