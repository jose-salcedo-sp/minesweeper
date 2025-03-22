import { CellState } from "@/types";
import Cell from "./cell";
import { useAuth } from "../contexts/auth-context";

export default function Board() {
  const { board } = useAuth();

  return (
    <div className="flex flex-col">
      {board.map((_, y) => {
        return (
          <div key={`row_${y}`} className="flex flex-row">
            {board[y].map((c, x) => {
              return typeof c === "number" ? (
                <Cell key={`cell_${x}_${y}`} state={CellState.n} number={c} x={x} y={y} />
              ) : (
                <Cell key={`cell_${x}_${y}`} state={CellState[c]} x={x} y={y} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
