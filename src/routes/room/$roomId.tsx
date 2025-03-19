import Board from '@/components/game/board';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/room/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
    return <div>
        <Board height={8} width={8} />
    </div>
}
