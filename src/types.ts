export const CellState = {
  "u": "Unreveiled",
  "e": "Empty",
  "b": "Bomb",
  "n": "Number",
  "x": "Explosion",
  "f": "Flagged"
} as const;

export type Identifier = keyof Omit<typeof CellState, "n"> | number;

export type CellStateType = (typeof CellState)[keyof typeof CellState]; // "u" | "e" | "b" | "n"
