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

type WebSocketContextType = {
  sendJsonMessage: (msg: unknown) => void;
  lastJsonMessage: unknown;
  readyState: ReadyState;
  login: (username: string, password: string, new_room: boolean) => void;
  register: (username: string, password: string) => void;
  updateBoard: (x: number, y: number, action: "r" | "f") => void;
  board: Identifier[][];
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const WS_URL = "ws://127.0.0.1:3030";
  const navigate = useNavigate();
  const [board, setBoard] = useState<Identifier[][]>(() => [
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
    ["u", "u", "u", "u", "u", "u", "u", "u"],
  ]);

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
    switch (lastJsonMessage?.type) {
      case "LOGIN": {
        if (lastJsonMessage?.success)
          navigate({ to: `/room/${lastJsonMessage?.room_id}` });
        break;
      }
      case "MOVE": {
        console.log(lastJsonMessage);

        break;
      }
      default: {
        console.error("Error wrong type!");
        break;
      }
    }
  }, [lastJsonMessage]);

  const contextValue = {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    login,
    register,
    updateBoard,
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
