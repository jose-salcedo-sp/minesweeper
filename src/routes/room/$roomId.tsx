"use client"
import { useEffect, useState } from "react"
import { createFileRoute, useParams } from "@tanstack/react-router"
import { Flag, Bomb, Trophy, Clock, Shield, Target } from "lucide-react"
import Board from "@/components/game/board"
import InstructionsTooltip from "@/components/game/toolTip"
import { useWebSocketContext } from "@/components/contexts/websocket-content"

export const Route = createFileRoute("/room/$roomId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomId } = useParams({ from: Route.id })
  const [username, setUsername] = useState("Player")
  const [opponentName, setOpponentName] = useState("Opponent")
  const [isLeader, setIsLeader] = useState(false)
  const [gameTime, setGameTime] = useState(0)
  const { board } = useWebSocketContext()

  // Calculate game stats based on board state
  const calculateStats = (board: any[]) => {
    let flagsMarked = 0
    let cellsDiscovered = 0

    board.forEach((row) => {
      row.forEach((cell: string) => {
        if (cell === "f") flagsMarked++
        if (typeof cell === "number" || cell === "e") cellsDiscovered++
      })
    })

    return { flagsMarked, cellsDiscovered }
  }

  const playerStats = calculateStats(board)
  const totalFlags = 10 // Typical mine count for 8x8
  const totalCells = 64 // 8x8 grid
  const remainingFlags = totalFlags - playerStats.flagsMarked

  // This would be replaced with your actual data fetching logic
  useEffect(() => {
    // Simulate fetching user data
    setUsername("Player1")
    setOpponentName("Challenger2")

    // Simulate game timer
    const timer = setInterval(() => {
      setGameTime((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Enhanced header with glass morphism effect */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/70 backdrop-blur-md z-10 border-b border-gray-700/50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left side - Tooltip and room info with improved styling */}
          <div className="flex items-center gap-3">
            <InstructionsTooltip />
            <div className="text-sm">
              <span className="text-gray-400">Room:</span>{" "}
              <span className="font-mono bg-gray-800/80 px-2 py-0.5 rounded-md text-blue-400 text-xs border border-blue-900/30">
                {roomId}
              </span>
            </div>
          </div>

          {/* Center - Game timer with enhanced styling */}
          <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700/50">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="font-mono text-blue-200 text-sm font-medium">{formatTime(gameTime)}</span>
          </div>

          {/* Right side - Player info with improved styling */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-800/60 px-3 py-1 rounded-full border border-gray-700/50 flex items-center">
              <span className="text-sm text-yellow-400 font-medium">{username}</span>
            </div>
            {isLeader && (
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-2 py-1 rounded-full text-xs flex items-center shadow-md animate-pulse">
                <Trophy className="h-3 w-3 mr-1" />
                Leading
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main game area with enhanced visual appeal */}
      <div className="pt-16 pb-6 px-4 flex flex-col items-center justify-center min-h-screen">
        {/* Enhanced game stats bar with improved visual design */}
        <div className="w-full max-w-4xl mb-6 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur rounded-xl shadow-xl p-3 border border-gray-700/50">
          <div className="flex flex-wrap justify-between items-center">
            {/* Left side stats with improved visual grouping */}
            <div className="flex items-center gap-4">
              {/* Remaining flags counter with enhanced styling */}
              <div className="flex flex-col items-center bg-gray-900/70 px-3 py-2 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="h-4 w-4 text-red-400" />
                  <span className="font-mono text-sm text-red-200 font-medium">{remainingFlags}</span>
                </div>
                <span className="text-xs text-gray-400">Remaining</span>
              </div>

              {/* Flags placed counter */}
              <div className="flex flex-col items-center bg-gray-900/70 px-3 py-2 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="font-mono text-sm text-blue-200 font-medium">{playerStats.flagsMarked}</span>
                </div>
                <span className="text-xs text-gray-400">Placed</span>
              </div>

              {/* Cells discovered counter */}
              <div className="flex flex-col items-center bg-gray-900/70 px-3 py-2 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-400" />
                  <span className="font-mono text-sm text-green-200 font-medium">
                    {playerStats.cellsDiscovered}/{totalCells}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Cleared</span>
              </div>
            </div>

            {/* VS display with enhanced styling */}
            <div className="flex items-center bg-gray-900/70 px-4 py-2 rounded-lg border border-gray-700/50">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400 mb-1">VERSUS</span>
                <span className="text-sm text-red-400 font-medium">{opponentName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game boards section with improved layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Player's board with enhanced corner icons */}
          <div className="relative">
            <div className="text-center mb-3 text-sm font-medium text-blue-400 bg-gray-800/60 py-1 rounded-full border border-blue-900/30">
              Your Board
            </div>

            {/* Improved corner icon placement for player board */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-blue-700/30 z-10">
              <Flag className="h-4 w-4 text-blue-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-blue-700/30 z-10">
              <Flag className="h-4 w-4 text-blue-300" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-blue-700/30 z-10">
              <Flag className="h-4 w-4 text-blue-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-blue-700/30 z-10">
              <Flag className="h-4 w-4 text-blue-300" />
            </div>

            {/* Enhanced board container */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-blue-500/10 blur-xl -z-10"></div>

              {/* Player's interactive board */}
              <Board isPlayerBoard={true} />

              {/* Subtle grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            </div>
          </div>

          {/* Opponent's board with enhanced corner icons */}
          <div className="relative">
            <div className="text-center mb-3 text-sm font-medium text-red-400 bg-gray-800/60 py-1 rounded-full border border-red-900/30">
              {opponentName}'s Board
            </div>

            {/* Improved corner icon placement for opponent board */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-red-700/30 z-10">
              <Bomb className="h-4 w-4 text-red-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-red-700/30 z-10">
              <Bomb className="h-4 w-4 text-red-300" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-red-700/30 z-10">
              <Bomb className="h-4 w-4 text-red-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-800 to-red-900 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform border-2 border-red-700/30 z-10">
              <Bomb className="h-4 w-4 text-red-300" />
            </div>

            {/* Enhanced board container */}
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-red-500/10 blur-xl -z-10"></div>

              {/* Opponent's non-interactive board */}
              <Board isPlayerBoard={false} />

              {/* Subtle grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Enhanced game instructions */}
        <div className="text-center text-gray-400 text-xs mt-6">
          <div className="bg-gray-800/50 inline-block px-4 py-2 rounded-lg border border-gray-700/50 shadow-md">
            <span className="text-white font-medium">Left-click</span> to reveal •
            <span className="text-white font-medium"> Right-click</span> to flag
          </div>
        </div>
      </div>

      {/* Enhanced background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Subtle animated background elements */}
        <div className="absolute top-[10%] left-[15%] w-16 h-16 opacity-5 animate-float-slow">
          <Flag className="w-full h-full text-blue-400" />
        </div>
        <div className="absolute bottom-[20%] right-[10%] w-12 h-12 opacity-5 animate-float-medium">
          <Bomb className="w-full h-full text-red-400" />
        </div>
        <div className="absolute top-[60%] left-[5%] w-10 h-10 opacity-5 animate-float-fast">
          <Flag className="w-full h-full text-blue-400" />
        </div>
        <div className="absolute top-[30%] right-[5%] w-14 h-14 opacity-5 animate-float-medium-reverse">
          <Bomb className="w-full h-full text-red-400" />
        </div>
      </div>
    </div>
  )
}

