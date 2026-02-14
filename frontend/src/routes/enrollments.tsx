// frontend/src/routes/enrollments.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { EnrollmentsPage } from "../features/enrollments/enrollments-page";

export const enrollmentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "enrollments",
  component: EnrollmentsRoute,
});

function EnrollmentsRoute(): JSX.Element {
  return <EnrollmentsPage />;
}
