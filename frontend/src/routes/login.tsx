// frontend/src/routes/login.tsx
import { createRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../features/-auth/login/login-page";
import { useAuthStore } from "../app/auth/auth-store";
import { rootRoute } from "./root";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  beforeLoad: () => {
    const state = useAuthStore.getState();
    const hasToken = Boolean(state.token ?? localStorage.getItem("nbsc-sims.token"));
    if (hasToken) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});
