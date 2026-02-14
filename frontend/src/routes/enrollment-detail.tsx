// frontend/src/routes/enrollment-detail.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { EnrollmentDetailPage } from "../features/enrollments/enrollment-detail-page";

export const enrollmentDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "enrollments/$enrollmentId",
  component: EnrollmentDetailRoute,
});

function EnrollmentDetailRoute(): JSX.Element {
  const { enrollmentId } = enrollmentDetailRoute.useParams();
  const parsedId = Number(enrollmentId);

  return <EnrollmentDetailPage enrollmentId={parsedId} />;
}
