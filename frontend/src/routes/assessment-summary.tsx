// frontend/src/routes/assessment-summary.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { AssessmentSummaryPage } from "../features/assessment/pages/assessment-summary-page";

export const assessmentSummaryRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "assessments/$assessmentId/summary",
  component: AssessmentSummaryRoute,
});

function AssessmentSummaryRoute(): JSX.Element {
  const { assessmentId } = assessmentSummaryRoute.useParams();
  const parsedId = Number(assessmentId);

  return <AssessmentSummaryPage assessmentId={parsedId} />;
}
