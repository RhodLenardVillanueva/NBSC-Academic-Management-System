// frontend/src/features/faculty/grade-workflow/types/grade-types.ts
// Grade workflow types for faculty grade encoding.

export type PaginatedResponse<TItem> = {
  data: TItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type CourseOfferingListItem = {
  id: number;
  section: string;
  is_active: boolean;
  subject?: {
    id: number;
    code: string;
    title: string;
  } | null;
  academic_year?: {
    id: number;
    name: string;
  } | null;
  semester?: {
    id: number;
    name: string;
  } | null;
  enrolled_count?: number;
};

export type CourseOfferingDetail = {
  id: number;
  subject?: {
    code: string | null;
    title: string | null;
  } | null;
  section: string | null;
  semester?: {
    id: number | null;
    name: string | null;
  } | null;
  academic_year?: {
    id: number | null;
    name: string | null;
  } | null;
  instructor?: string | null;
};

export type StudentGrade = {
  enrollment_subject_id: number;
  student: {
    id: number | null;
    student_number: string | null;
    first_name: string | null;
    last_name: string | null;
    program: string | null;
  };
  quizzes: string | null;
  projects: string | null;
  participation: string | null;
  major_exams: string | null;
  final_numeric_grade: string | null;
  grade_point: string | null;
  remarks: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
};

export type CourseOfferingStudentsResponse = {
  course_offering: CourseOfferingDetail | null;
  students: StudentGrade[];
};

export type GradeUpdatePayload = {
  quizzes: number | null;
  projects: number | null;
  participation: number | null;
  major_exams: number | null;
};

export type GradeSubmissionResponse = {
  id: number;
  enrollment_id: number;
  course_offering_id: number;
  quizzes: string | null;
  projects: string | null;
  participation: string | null;
  major_exams: string | null;
  final_numeric_grade: string | null;
  grade_point: string | null;
  remarks: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
};

export type OfferingStatus = "open" | "submitted" | "loading";

export type GradeField = "quizzes" | "projects" | "participation" | "major_exams";

export type GradeDraft = Record<GradeField, string>;
