// frontend/src/app/App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { AppProviders } from "./providers";
import { router } from "../routes/router";

export function App(): JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
