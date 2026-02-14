// frontend/src/routes/root.tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout(): JSX.Element {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
