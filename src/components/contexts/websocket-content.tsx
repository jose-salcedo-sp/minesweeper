import { Identifier } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type Board = Identifier[][];
type Game = {
  username: string;
  board: Board;
  status: string;
};

type Room = {
  me: Game;
  oponent: Game;
};

type WebSocketContextType = {
  sendJsonMessage: (msg: unknown) => void;
  lastJsonMessage: unknown;
  readyState: ReadyState;
  login: (username: string, password: string, new_room: boolean) => void;
  register: (username: string, password: string) => void;
  updateBoard: (x: number, y: number, action: "r" | "f") => void;
  room: Room;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const WS_URL = "ws://127.0.0.1:3030";
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room>(() => ({
    me: {
      username: "",
      board: [
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
      ],
      status: "ONGOING",
    },
    oponent: {
      username: "",
      board: [
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
        ["u", "u", "u", "u", "u", "u", "u", "u"],
      ],
      status: "ONGOING",
    },
  }));

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: true, // share socket between components
      shouldReconnect: () => true,
    },
  );

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
    console.log(lastJsonMessage);

    switch (lastJsonMessage?.type) {
      case "LOGIN": {
        if (lastJsonMessage?.success) {
          const username = lastJsonMessage.username;
          const emptyBoard: Identifier[][] = Array.from({ length: 8 }, () =>
            Array(8).fill("u"),
          );

          setRoom((prev) => ({
            ...prev,
            [username]: {
              board: emptyBoard,
              status: "ONGOING",
            },
          }));

          navigate({ to: `/room/${lastJsonMessage.room_id}` });
        }
        break;
      }
      case "MOVE": {
        if (typeof lastJsonMessage.board === "string") {
          const flatBoard = lastJsonMessage.board.split("");
          const newBoard: Identifier[][] = [];

          for (let row = 0; row < 8; row++) {
            newBoard.push(flatBoard.slice(row * 8, row * 8 + 8));
          }

          const username = lastJsonMessage.player;

          setRoom((prev) => ({
            ...prev,
            [username]: {
              board: newBoard,
              status:
                lastJsonMessage.status || prev[username]?.status || "ONGOING",
            },
          }));
        } else {
          console.error("Invalid board format");
        }
        break;
      }

      default: {
        console.error("Error wrong type!");
        break;
      }
    }
  }, [lastJsonMessage]);

  const contextValue: WebSocketContextType = {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    login,
    register,
    updateBoard,
    room,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error(
      "useWebSocketContext must be used inside a WebSocketProvider",
    );
  return ctx;
};
