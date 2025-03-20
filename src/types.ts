export type Identifier = "u" | "e" | "b" | "x" | "f" | number;

export const CellState = {
  "u": "Unreveiled",
  "e": "Empty",
  "b": "Bomb",
  "n": "Number",
  "x": "Explosion",
  "f": "Flagged"
} as const;

export type CellStateType = (typeof CellState)[keyof typeof CellState]; // "u" | "e" | "b" | "n"
