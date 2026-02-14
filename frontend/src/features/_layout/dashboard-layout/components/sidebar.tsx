// frontend/src/features/_layout/dashboard-layout/components/sidebar.tsx
import { useRouterState } from "@tanstack/react-router";
import { Button } from "../../../../shared/ui/button";
import { NavItemComponent } from "./nav-item";
import type { NavItem } from "../types/nav-types";

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userEmail: string;
  onLogout: () => void;
};

const iconClass = "h-4 w-4";

function DashboardIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="3" />
      <path d="M3 20c0-3 3-5 6-5" />
      <path d="M13 20c0-2.5 2-4.5 4.5-4.5" />
    </svg>
  );
}

function BookIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h12a3 3 0 0 1 3 3v10H7a3 3 0 0 0-3 3V6z" />
      <path d="M4 6a3 3 0 0 1 3-3h12v16" />
    </svg>
  );
}

function CalendarIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function LayersIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}

function ListIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </svg>
  );
}

function ClipboardIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function DocumentIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8" />
    </svg>
  );
}

function CapIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 12v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" />
    </svg>
  );
}

function LogoutIcon(): JSX.Element {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Students", path: "/students", icon: <UsersIcon /> },
  { label: "Programs", path: "/programs", icon: <CapIcon /> },
  { label: "Subjects", path: "/subjects", icon: <BookIcon /> },
  { label: "Faculty", path: "/faculty", icon: <UsersIcon /> },
  { label: "Grade Encoding", path: "/faculty/grades", icon: <ClipboardIcon /> },
  { label: "Assessment / Billing", path: "/assessment", icon: <DocumentIcon /> },
  { label: "Academic Years", path: "/academic-years", icon: <CalendarIcon /> },
  { label: "Semesters", path: "/semesters", icon: <LayersIcon /> },
  { label: "Course Offerings", path: "/course-offerings", icon: <ListIcon /> },
  { label: "Enrollments", path: "/enrollments", icon: <ClipboardIcon /> },
  { label: "Transcript", path: "/transcript", icon: <DocumentIcon /> },
];

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  userEmail,
  onLogout,
}: SidebarProps): JSX.Element {
  const currentPath = useRouterState({ select: (state) => state.location.pathname });
  const widthClass = isCollapsed ? "w-16" : "w-64";
  const translateClass = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
        />
      ) : null}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 print:hidden",
          widthClass,
          translateClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className={isCollapsed ? "sr-only" : "text-sm font-semibold text-slate-700"}>
            Navigation
          </span>
          <Button
            type="button"
            variant="secondary"
            className="h-8 w-8 p-0"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? ">>" : "<<"}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.path}
                item={item}
                isCollapsed={isCollapsed}
                currentPath={currentPath}
                onNavigate={onCloseMobile}
              />
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-200 px-2 py-4">
          <div className={isCollapsed ? "flex flex-col items-center gap-2" : "px-2"}>
            <span className={isCollapsed ? "sr-only" : "text-xs text-slate-500"}>
              {userEmail}
            </span>
            <Button
              type="button"
              variant="secondary"
              className={isCollapsed ? "h-10 w-10 p-0" : "w-full justify-start gap-2"}
              onClick={onLogout}
              aria-label="Logout"
            >
              <LogoutIcon />
              <span className={isCollapsed ? "sr-only" : ""}>Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
