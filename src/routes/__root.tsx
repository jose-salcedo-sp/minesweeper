import { WebSocketProvider } from "@/components/contexts/websocket-content";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: () => (
    <WebSocketProvider>
      <Outlet>
        <TanStackRouterDevtools />
        <Toaster />
      </Outlet>
    </WebSocketProvider>
  ),
});
