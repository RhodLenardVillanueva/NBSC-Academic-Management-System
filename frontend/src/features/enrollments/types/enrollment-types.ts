// frontend/src/features/enrollments/types/enrollment-types.ts
export type EnrollmentStatus = "enrolled" | "cancelled" | "completed";

export type Enrollment = {
  id: number;
  student_id: number;
  program_id: number;
  academic_year_id: number;
  semester_id: number;
  year_level: number;
  total_units: number;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
};

export type EnrollmentFormValues = {
  student_id: string;
  academic_year_id: string;
  semester_id: string;
  year_level: string;
  status: EnrollmentStatus;
};

export type EnrollmentPayload = {
  student_id: number;
  program_id: number;
  academic_year_id: number;
  semester_id: number;
  year_level: number;
  total_units?: number;
  status: EnrollmentStatus;
};

export type EnrollmentSubjectPayload = {
  enrollment_id: number;
  course_offering_id: number;
};

export type EnrollmentCorSubject = {
  enrollment_subject_id: number | null;
  course_offering_id: number | null;
  subject_code: string | null;
  subject_title: string | null;
  units: number | null;
  section: string | null;
  schedule: string | null;
  room: string | null;
  faculty?: string | null;
};

export type EnrollmentCor = {
  enrollment_id: number;
  enrollment?: {
    id: number;
    year_level: number;
    status: EnrollmentStatus;
    total_units: number;
  };
  student: {
    id: number | null;
    student_number: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  program: {
    id: number | null;
    name: string | null;
  };
  academic_year: {
    id: number | null;
    name: string | null;
  };
  semester: {
    id: number | null;
    name: string | null;
  };
  subjects: EnrollmentCorSubject[];
  total_units: number;
};

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};
