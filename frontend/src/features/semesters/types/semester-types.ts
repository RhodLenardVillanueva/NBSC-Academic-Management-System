// frontend/src/features/semesters/types/semester-types.ts
export type Semester = {
  id: number;
  name: string;
  academic_year_id: number;
  is_current: boolean;
  add_drop_start: string | null;
  add_drop_end: string | null;
  created_at: string;
  updated_at: string;
};

export type SemesterFormValues = {
  name: string;
  academic_year_id: string;
  is_current: "true" | "false";
  add_drop_start: string;
  add_drop_end: string;
};

export type SemesterPayload = {
  name: string;
  academic_year_id: number;
  is_current: boolean;
  add_drop_start: string;
  add_drop_end: string;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
