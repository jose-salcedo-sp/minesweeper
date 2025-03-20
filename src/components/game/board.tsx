import { CellState, Identifier } from "@/types";
import Cell from "./cell";

type Props = {
  width: number;
  height: number;
};

const board: Identifier[][] = [
  ["u", "e", 1, "b", "u", "e", 1, "b"],
  ["u", "e", 2, "b", "u", "e", "f", "b"],
  ["u", "f", 3, "b", "u", "e", 3, "f"],
  ["u", "e", 4, "b", "x", "e", 4, "b"],
  ["u", "e", "f", "b", "u", "e", 5, "b"],
  ["u", "f", 6, "b", "u", "e", 6, "b"],
  ["u", "e", 7, "b", "u", "e", 7, "f"],
  ["u", "e", 8, "b", "u", "e", 8, "b"],
];

export default function Board(props: Props) {
  return (
    <div className="flex flex-col">
      {board.map((_, y) => {
        return (
          <div key={`row_${y}`} className="flex flex-row">
            {board[y].map((c, x) => {
              return typeof c === "number" ? (
                <Cell key={`cell_${x}_${y}`} state={CellState.n} number={c} />
              ) : (
                <Cell key={`cell_${x}_${y}`} state={CellState[c]} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
