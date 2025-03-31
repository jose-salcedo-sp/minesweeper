"use client"
import { useEffect, useState } from "react"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { Flag, Bomb, Trophy } from "lucide-react"
import Board from "@/components/game/board"

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
})


function RouteComponent() {
  const { roomId } = useParams({from: Route.id})
  const [username, setUsername] = useState("Player")
  const [isLeader, setIsLeader] = useState(true)
  const totalCells = 64; // 8x8 grid
  const totalFlags = 10; // Typical mine count

  // This would be replaced with your actual data fetching logic
  useEffect(() => {
    // Simulate fetching user data
    setUsername("Player1")

  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Game header */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Welcome to Minesweeper <span className="text-yellow-400">{username}</span>
        </h1>
        <h2 className="text-lg md:text-xl text-center text-gray-300 mb-6">
          You're in room <span className="font-mono bg-gray-700 px-2 py-1 rounded">{roomId}</span>
        </h2>

        {/* Game stats */}
        <div className="max-w-md mb-1 mx-auto bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Flag className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-mono">
                {/* {flagsMarked}/{totalFlags} */}
              </span>
            </div>

            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
              <span className="font-mono">
                {/* {cellsDiscovered}/{totalCells} */}
              </span>
            </div>

            {isLeader && (
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm">Leading</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game board */}
      <div className="container mx-auto px-4 flex justify-center">
        <div className="relative bg-gray-700 p-4 rounded-lg shadow-2xl">

          <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Bomb className="h-4 w-4 text-gray-300" />
          </div>
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Bomb className="h-4 w-4 text-gray-300" />
          </div>

          {Board ? (
            <Board />
          ) : (
            <div className="w-64 h-64 bg-gray-600 rounded-lg grid grid-cols-8 gap-0.5">
              {Array(64)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-500 hover:bg-gray-400 rounded-sm"></div>
                ))}
            </div>
          )}

          <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Bomb className="h-4 w-4 text-gray-300" />
          </div>
          <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <Bomb className="h-4 w-4 text-gray-300" />
          </div>

        </div>
      </div>

      {/* Game instructions */}
      <div className="container mx-auto px-4 mt-4 text-center text-gray-400 text-sm">
        <p>Left-click to reveal a cell • Right-click to place a flag</p>
        <p className="mt-1">First to clear the board wins!</p>
        <br/>
      </div>
    </div>
  )
}
