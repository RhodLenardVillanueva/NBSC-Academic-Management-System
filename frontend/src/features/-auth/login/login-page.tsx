// frontend/src/features/-auth/login/login-page.tsx
import { LoginForm } from "./login-form";

export function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <LoginForm />
      </div>
    </div>
  );
}
