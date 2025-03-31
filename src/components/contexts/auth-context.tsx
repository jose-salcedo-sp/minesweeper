import { Identifier } from "@/types";
import { ReactNode } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type AuthContext = {
  name: string;
  login: (username: string, password: string, new_room: boolean) => void;
  register: (username: string, password: string) => void;
  board: Identifier[][];
  updateBoard: (x: number, y: number, action: "r" | "f") => void;
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
  register: () => {},
  updateBoard: () => {},
  flagsMarked: 0,
  cellsDiscovered: 0,
});

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
  const [isWsReady, setIsWsReady] = useState(false);
  // const navigate = useNavigate();
  const WS_URL = "ws://127.0.0.1:3030";
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  );

  const [name, setName] = useState("");
  const [board, setBoard] = useState<Identifier[][]>(() =>
    default_board.map((row) => [...row]),
  );
  const [flagsMarked, setFlagsMarked] = useState(0);
  const [cellsDiscovered, setCellsDiscovered] = useState(0);

  function updateBoard(x: number, y: number, action: "f" | "r") {
    try {
      sendJsonMessage({
        type: "MOVE",
        x,
        y,
        action,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function login(username: string, password: string, new_room: boolean) {
    try {
      sendJsonMessage({
        type: "LOGIN",
        password,
        username,
        new_room: !new_room,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function register(username: string, password: string) {
    try {
      sendJsonMessage({
        type: "REGISTER",
        username,
        password,
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    console.log("Connection state changed");
    if (readyState === ReadyState.OPEN) {
      setIsWsReady(true);
    } else {
      setIsWsReady(false);
    }
  }, [readyState]);

  useEffect(() => {
    console.log(lastJsonMessage);
    if (lastJsonMessage?.type === "LOGIN" && lastJsonMessage?.success) {
      // navigate({ to: `/room/${lastJsonMessage.room_id}` });
      document.location.replace(`/room/${lastJsonMessage.room_id}`);
    }
  }, [lastJsonMessage]);

  return (
    <authContext.Provider
      value={{
        name,
        login,
        register,
        board,
        updateBoard,
        flagsMarked,
        cellsDiscovered,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export function useAuth() {
  return useContext(authContext);
}
