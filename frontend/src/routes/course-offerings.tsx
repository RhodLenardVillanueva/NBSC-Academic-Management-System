// frontend/src/routes/course-offerings.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { CourseOfferingsPage } from "../features/course-offerings/course-offerings-page";

export const courseOfferingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "course-offerings",
  component: CourseOfferingsRoute,
});

function CourseOfferingsRoute(): JSX.Element {
  return <CourseOfferingsPage />;
}
