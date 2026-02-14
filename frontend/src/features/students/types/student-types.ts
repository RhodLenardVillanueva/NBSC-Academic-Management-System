// frontend/src/features/students/types/student-types.ts
export type StudentStatus = "active" | "dropped" | "graduated";

export type Student = {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  program_id: number | null;
  year_level: number;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
};

export type StudentFormValues = {
  student_number: string;
  first_name: string;
  last_name: string;
  program_id: string;
  year_level: string;
  status: StudentStatus;
};

export type StudentPayload = {
  student_number: string;
  first_name: string;
  last_name: string;
  program_id: number | null;
  year_level: number;
  status: StudentStatus;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
