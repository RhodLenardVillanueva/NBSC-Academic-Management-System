// frontend/src/features/academic-years/types/academic-year-types.ts
export type AcademicYear = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicYearFormValues = {
  year_start: string;
  year_end: string;
  is_current: "true" | "false";
};

export type AcademicYearPayload = {
  name: string;
  is_active: boolean;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
