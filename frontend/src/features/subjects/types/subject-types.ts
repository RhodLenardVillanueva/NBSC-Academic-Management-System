// frontend/src/features/subjects/types/subject-types.ts
export type Subject = {
  id: number;
  code: string;
  title: string;
  units: number;
  lecture_hours: number;
  lab_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SubjectFormValues = {
  code: string;
  title: string;
  units: string;
  lecture_hours: string;
  lab_hours: string;
  is_active: "true" | "false";
};

export type SubjectPayload = {
  code: string;
  title: string;
  units: number;
  lecture_hours: number;
  lab_hours: number;
  is_active: boolean;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
