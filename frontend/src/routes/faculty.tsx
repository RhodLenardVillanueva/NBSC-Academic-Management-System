// frontend/src/routes/faculty.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { FacultyPage } from "../features/faculty/faculty-page";

export const facultyRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "faculty",
  component: FacultyRoute,
});

function FacultyRoute(): JSX.Element {
  return <FacultyPage />;
}
