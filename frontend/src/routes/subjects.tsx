// frontend/src/routes/subjects.tsx
import { createRoute } from "@tanstack/react-router";
import { protectedRoute } from "./protected-route";
import { SubjectsPage } from "../features/subjects/subjects-page";

export const subjectsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "subjects",
  component: SubjectsRoute,
});

function SubjectsRoute(): JSX.Element {
  return <SubjectsPage />;
}
