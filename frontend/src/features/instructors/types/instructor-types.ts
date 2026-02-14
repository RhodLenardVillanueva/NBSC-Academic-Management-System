// frontend/src/features/instructors/types/instructor-types.ts
export type Instructor = {
  id: number;
  employee_number: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  department: string | null;
  status: "active" | "inactive";
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
