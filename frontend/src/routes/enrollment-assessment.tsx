// frontend/src/routes/enrollment-assessment.tsx
import { createRoute } from "@tanstack/react-router";
import { EnrollmentAssessmentPage } from "../features/assessment/enrollment-assessment-page";
import { protectedRoute } from "./protected-route";

export const enrollmentAssessmentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "enrollments/$enrollmentId/assessment",
  component: EnrollmentAssessmentRoute,
});

function EnrollmentAssessmentRoute(): JSX.Element {
  const { enrollmentId } = enrollmentAssessmentRoute.useParams();
  const parsedId = Number(enrollmentId);

  return <EnrollmentAssessmentPage enrollmentId={parsedId} />;
}
