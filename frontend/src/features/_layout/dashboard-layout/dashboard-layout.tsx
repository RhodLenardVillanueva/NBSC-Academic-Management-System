// frontend/src/features/_layout/dashboard-layout/dashboard-layout.tsx
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../app/auth/auth-store";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";

export function DashboardLayout(): JSX.Element {
  const navigate = useNavigate();
  const userEmail = useAuthStore((state) => state.user?.email ?? "Unknown");
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async (): Promise<void> => {
    await logout();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          onCloseMobile={() => setIsMobileOpen(false)}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onToggleSidebar={() => setIsMobileOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
