"use client"

import { CellState } from "@/types"
import Cell from "./cell"
import { useAuth } from "../contexts/auth-context"

export default function Board() {
  const { board } = useAuth()

  return (
    <div className="relative">
      {/* Board shadow and glow effect */}
      <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-xl -z-10"></div>

      {/* Main board container */}
      <div className="bg-gray-800 p-2 md:p-3 rounded-xl shadow-xl border border-gray-700">
        <div className="flex flex-col gap-0.5">
          {board.map((_, y) => {
            return (
              <div key={`row_${y}`} className="flex flex-row gap-0.5">
                {board[y].map((c, x) => {
                  return typeof c === "number" ? (
                    <Cell key={`cell_${x}_${y}`} state={CellState.n} number={c} x={x} y={y} />
                  ) : (
                    <Cell key={`cell_${x}_${y}`} state={CellState[c]} x={x} y={y} />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Board grid overlay for visual effect */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none rounded-xl"></div>
    </div>
  )
}

