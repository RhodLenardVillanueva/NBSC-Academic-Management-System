// frontend/src/routes/protected-route.tsx
import { createRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "../features/_layout/dashboard-layout/dashboard-layout";
import { useAuthStore } from "../app/auth/auth-store";
import { rootRoute } from "./root";

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  beforeLoad: () => {
    const state = useAuthStore.getState();
    const hasToken = Boolean(state.token ?? localStorage.getItem("nbsc-sims.token"));
    if (!hasToken) {
      throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});
