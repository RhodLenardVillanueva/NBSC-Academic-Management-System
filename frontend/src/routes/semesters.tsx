// frontend/src/routes/semesters.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { SemestersPage } from "../features/semesters/semesters-page";

export const semestersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "semesters",
  component: SemestersRoute,
});

function SemestersRoute(): JSX.Element {
  return <SemestersPage />;
}
