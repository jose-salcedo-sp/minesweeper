import { CellState } from "@/types"
import Cell from "./cell"

type Props = {
    width: number,
    height: number
}

export default function Board(props: Props) {
    return <div className="flex flex-col">
        {[...Array(props.height)].map((_, y) => {
            return <div key={`row_${y}`} className="flex flex-row">
                {[...Array(props.width)].map((_, x) => {
                    return <Cell key={`cell_${x}_${y}`} state={CellState.Number} number={x + 1} />
                })}
                </div>
            })
        })
    </div>
}
