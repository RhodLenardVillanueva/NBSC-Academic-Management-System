// frontend/src/routes/faculty-grades-detail.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { GradeWorkflowPage } from "../features/faculty/grade-workflow/grade-workflow-page";

export const facultyGradesDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "faculty/grades/$offeringId",
  component: FacultyGradesDetailRoute,
});

function FacultyGradesDetailRoute(): JSX.Element {
  const { offeringId } = facultyGradesDetailRoute.useParams();
  const parsedId = Number(offeringId);

  return <GradeWorkflowPage offeringId={parsedId} />;
}
