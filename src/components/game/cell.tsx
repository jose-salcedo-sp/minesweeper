import { CellState, CellStateType } from "@/types";
import { BombIcon, FlagTriangleRight, TargetIcon } from "lucide-react";
import { JSX } from "react";

type Props =
  | {
      state: typeof CellState.n;
      number: number;
    }
  | {
      state: Exclude<CellStateType, typeof CellState.n>;
    };

const cell_variants: Record<
  Exclude<CellStateType, typeof CellState.n>,
  JSX.Element
> = {
  [CellState.u]: <UnreveiledCell />,
  [CellState.e]: <EmptyCell />,
  [CellState.x]: <ExplosionCell />,
  [CellState.f]: <FlagCell />,
  [CellState.b]: <BombCell />,
};

export default function Cell(props: Props) {
  switch (props.state) {
    case CellState.n: // Check number variant because it comes with props
      return <NumberCell n={props.number} />;
    default: // No need to check any of the other variants
      return cell_variants[props.state];
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
