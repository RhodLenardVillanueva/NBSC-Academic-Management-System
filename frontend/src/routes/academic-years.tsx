// frontend/src/routes/academic-years.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { AcademicYearsPage } from "../features/academic-years/academic-years-page";

export const academicYearsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "academic-years",
  component: AcademicYearsRoute,
});

function AcademicYearsRoute(): JSX.Element {
  return <AcademicYearsPage />;
}
