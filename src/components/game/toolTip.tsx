import { useState } from "react"
import { AlertCircle, MousePointerClick, MousePointerIcon as MousePointerSquare } from "lucide-react"

export default function InstructionsTooltip() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      {/* Exclamation icon button */}
      <button
        className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-gray-800"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Game Instructions"
      >
        <AlertCircle className="w-5 h-5" />
      </button>

      {/* Tooltip card */}
      <div
        className={`absolute z-50 w-72 md:w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 text-white transform transition-all duration-200 origin-top-left ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
        style={{ top: "calc(100% + 10px)", left: "-10px" }}
      >
        {/* Tooltip arrow */}
        <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-800 border-t border-l border-gray-700 transform rotate-45"></div>

        <h3 className="text-lg font-bold text-yellow-400 mb-2">💣 Minesweeper Mayhem! 💣</h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <MousePointerClick className="w-5 h-5 text-blue-400" />
            </div>
            <p>
              <span className="font-bold text-blue-400">Left-click</span> to reveal a cell. Choose wisely! Numbers show
              how many mines are nearby.
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <MousePointerSquare className="w-5 h-5 text-red-400" />
            </div>
            <p>
              <span className="font-bold text-red-400">Right-click</span> to place a flag where you think a mine is
              hiding. Flag all mines to win!
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <span className="text-lg font-bold">🏆</span>
            </div>
            <p>
              Race against your opponent! First player to safely clear their board wins the game and eternal bragging
              rights!
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-2">
              <span className="text-lg font-bold">💥</span>
            </div>
            <p>
              Click on a mine and <span className="font-bold text-red-500">BOOM!</span> Game over for you! Be careful
              and use the numbers as your guide.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 italic">
          Pro tip: Start with corners and edges - they often have fewer adjacent mines!
        </div>
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 italic">
          About: Teacher: Dr. Juan Carlos López Pimentel. Students: David Contreras Tiscareño (davidct9),
          Héctor Emiliano Flores Castellanos (eselemu),
          José Salcedo Uribe (jose-salcedo-sp)
        </div>
      </div>
    </div>
  )
}
