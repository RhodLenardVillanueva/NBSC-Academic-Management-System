// frontend/src/routes/students.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { StudentsPage } from "../features/students/students-page";

export const studentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "students",
  component: StudentsRoute,
});

function StudentsRoute(): JSX.Element {
  return <StudentsPage />;
}
