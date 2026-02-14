// frontend/src/features/_layout/dashboard-layout/types/nav-types.ts
import type { ReactNode } from "react";

export type NavItem = {
  label: string;
  icon: ReactNode;
  path: string;
  children?: NavItem[];
};
