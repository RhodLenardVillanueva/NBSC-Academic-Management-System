// frontend/src/features/faculty/types/faculty-types.ts
export type FacultyMember = {
  id: number;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type FacultyFormValues = {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  status: "active" | "inactive";
};

export type FacultyPayload = {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string;
  status: "active" | "inactive";
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
