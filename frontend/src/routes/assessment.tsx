// frontend/src/routes/assessment.tsx
import { createRoute } from "@tanstack/react-router";
import { AssessmentPage } from "../features/assessment/assessment-page";
import { protectedRoute } from "./protected-route";

export const assessmentRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "assessment",
  component: AssessmentRoute,
});

function AssessmentRoute(): JSX.Element {
  return <AssessmentPage />;
}
