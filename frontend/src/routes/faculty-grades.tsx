// frontend/src/routes/faculty-grades.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { GradeWorkflowPage } from "../features/faculty/grade-workflow/grade-workflow-page";

export const facultyGradesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "faculty/grades",
  component: FacultyGradesRoute,
});

function FacultyGradesRoute(): JSX.Element {
  return <GradeWorkflowPage />;
}
