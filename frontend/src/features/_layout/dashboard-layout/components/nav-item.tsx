// frontend/src/features/_layout/dashboard-layout/components/nav-item.tsx
import { Link } from "@tanstack/react-router";
import type { NavItem } from "../types/nav-types";

type NavItemProps = {
  item: NavItem;
  isCollapsed: boolean;
  currentPath: string;
  depth?: number;
  onNavigate?: () => void;
};

const isPathActive = (currentPath: string, itemPath: string): boolean => {
  if (currentPath === itemPath) {
    return true;
  }
  return currentPath.startsWith(`${itemPath}/`);
};

export function NavItemComponent({
  item,
  isCollapsed,
  currentPath,
  depth = 0,
  onNavigate,
}: NavItemProps): JSX.Element {
  const active = isPathActive(currentPath, item.path);
  const baseClasses = [
    "flex items-center rounded-md py-2 text-sm transition-colors",
    active ? "bg-[#FBEAEA] text-[#8B1E1E]" : "text-slate-600 hover:bg-slate-50",
    isCollapsed ? "justify-center px-2" : depth > 0 ? "pl-10 pr-3" : "px-4",
  ]
    .filter(Boolean)
    .join(" ");
  const iconClasses = active ? "text-[#8B1E1E]" : "text-slate-500";

  return (
    <li className="flex flex-col gap-1">
      <Link
        to={item.path}
        className={baseClasses}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
      >
        <span className={`flex h-5 w-5 items-center justify-center ${iconClasses}`}>
          {item.icon}
        </span>
        <span className={isCollapsed ? "sr-only" : "ml-3"}>{item.label}</span>
      </Link>
      {item.children && item.children.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {item.children.map((child) => (
            <NavItemComponent
              key={child.path}
              item={child}
              isCollapsed={isCollapsed}
              currentPath={currentPath}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
