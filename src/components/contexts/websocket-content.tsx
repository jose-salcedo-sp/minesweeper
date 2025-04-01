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

          setRoom((prev) => ({
            ...prev,
            me: {
              ...prev.me,
              username,
            },
          }));

          navigate({ to: `/room/${lastJsonMessage.room_id}` });
        }
        break;
      }
      case "JOINED": {
        const username = lastJsonMessage.username;

        setRoom((prev) => ({
          ...prev,
          oponent: {
            ...prev.oponent,
            username,
          },
        }));
        break;
      }
      case "MOVE": {
        if (lastJsonMessage.success) {
          const flatBoard = lastJsonMessage.board.split("");
          const newBoard: Identifier[][] = [];

          for (let row = 0; row < 8; row++) {
            newBoard.push(flatBoard.slice(row * 8, row * 8 + 8));
          }

          if (lastJsonMessage.player === room.me.username) {
            setRoom((prev) => ({
              ...prev,
              me: {
                ...prev.me,
                board: newBoard,
                status: lastJsonMessage.status,
              },
            }));
          } else {
            setRoom((prev) => ({
              ...prev,
              oponent: {
                ...prev.oponent,
                board: newBoard,
                status: lastJsonMessage.status,
              },
            }));
          }
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

  useEffect(() => {
    console.log(room);
  }, [room]);

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
