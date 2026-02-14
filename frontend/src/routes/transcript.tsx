// frontend/src/routes/transcript.tsx
import { createRoute } from "@tanstack/react-router";
import { TranscriptPage } from "../features/transcript/transcript-page";
import { protectedRoute } from "./protected-route";

export const transcriptRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "transcript",
  component: TranscriptRoute,
});

function TranscriptRoute(): JSX.Element {
  return <TranscriptPage />;
}
