import { CellState } from "@/types";
import { BombIcon } from "lucide-react";

type NumberCellProps = {
  state: CellState.Number;
  number: number;
};

type OtherCellProps = {
  state: Exclude<CellState, CellState.Number>;
};

type Props = NumberCellProps | OtherCellProps;

export default function Cell(props: Props) {
  return props.state === CellState.Unreveiled ? (
    <UnreveiledCell />
  ) : props.state === CellState.Empty ? (
    <EmptyCell />
  ) : props.state === CellState.Number ? (
    <NumberCell n={props.number!} />
  ) : (
    <BombCell />
  );
}

const number_colors = [
    "text-blue-400",
    "text-green-400",
    "text-red-500",
    "text-blue-500",
    "text-red-700",
    "text-teal-700",
    "text-gray-400",
    "text-orange-900"
] as const;

function UnreveiledCell() {
  return (
    <div className="aspect-square w-10 bg-gray-500 border-2 border-gray-800"></div>
  );
}

function EmptyCell() {
  return <div className="aspect-square w-10 bg-gray-800"></div>;
}

function NumberCell({ n }: { n: number }) {
  return (
    <div className="aspect-square w-10 bg-gray-900 flex justify-center items-center">
          <span className={`${number_colors[n-1]}`}>{n}</span>
    </div>
  );
}

function BombCell() {
  return (
    <div className="aspect-square w-10 bg-gray-800 flex justify-center items-center">
      <BombIcon size={20} className="bg-red-500"/>
    </div>
  );
}
