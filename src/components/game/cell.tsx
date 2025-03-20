import { CellState, CellStateType } from "@/types";
import { BombIcon, FlagIcon, FlagTriangleRight, TargetIcon } from "lucide-react";

type Props =
  | {
      state: typeof CellState.n;
      number: number;
    }
  | {
      state: Exclude<CellStateType, typeof CellState.n>;
    };

export default function Cell(props: Props) {
  if (props.state === CellState.u) {
    return <UnreveiledCell />;
  } else if (props.state === CellState.e) {
    return <EmptyCell />;
  } else if (props.state === CellState.n) {
    return <NumberCell n={props.number} />;
  } else if (props.state === CellState.x) {
    return <ExplosionCell />;
  } else if (props.state === CellState.f) {
    return <FlagCell />;
  } else {
    return <BombCell />;
  }
}

const number_colors = [
  "text-blue-400",
  "text-green-400",
  "text-red-500",
  "text-blue-500",
  "text-red-700",
  "text-teal-700",
  "text-gray-400",
  "text-orange-900",
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
    <div className="aspect-square w-10 bg-gray-800 flex justify-center items-center">
      <span className={`${number_colors[n - 1]}`}>{n}</span>
    </div>
  );
}

function ExplosionCell() {
  return (
    <div className="aspect-square w-10 bg-red-500 flex justify-center items-center">
      <TargetIcon
        size={20}
        className="text-black animate-ping repeat-infinite"
      />
    </div>
  );
}

function BombCell() {
  return (
    <div className="aspect-square w-10 bg-gray-800 flex justify-center items-center">
      <BombIcon size={20} className="text-red-500" />
    </div>
  );
}

function FlagCell() {
  return (
    <div className="aspect-square w-10 bg-gray-500 flex justify-center items-center">
      <FlagTriangleRight size={20} className="text-black" />
    </div>
  );
}
