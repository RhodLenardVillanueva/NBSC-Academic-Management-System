// frontend/src/routes/dashboard.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { DashboardStats } from "../features/dashboard-stats/dashboard-stats";

export const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "dashboard",
  component: DashboardRoute,
});

function DashboardRoute(): JSX.Element {
  return (
    <DashboardStats />
  );
}
