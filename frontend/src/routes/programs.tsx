// frontend/src/routes/programs.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { ProgramsPage } from "../features/programs/programs-page";

export const programsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "programs",
  component: ProgramsRoute,
});

function ProgramsRoute(): JSX.Element {
  return <ProgramsPage />;
}
