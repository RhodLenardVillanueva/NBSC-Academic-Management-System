// frontend/src/features/course-offerings/types/course-offering-types.ts
export type CourseOffering = {
  id: number;
  subject_id: number;
  instructor_id: number;
  academic_year_id: number;
  semester_id: number;
  section: string;
  schedule: string | null;
  room: string | null;
  max_slots: number;
  slots_taken: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseOfferingFormValues = {
  subject_id: string;
  instructor_id: string;
  academic_year_id: string;
  semester_id: string;
  section: string;
  schedule: string;
  room: string;
  max_slots: string;
  slots_taken: string;
  is_active: "true" | "false";
};

export type CourseOfferingPayload = {
  subject_id: number;
  instructor_id: number;
  academic_year_id: number;
  semester_id: number;
  section: string;
  schedule: string | null;
  room: string | null;
  max_slots: number;
  is_active: boolean;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
