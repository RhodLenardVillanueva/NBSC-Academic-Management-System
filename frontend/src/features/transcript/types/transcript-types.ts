// frontend/src/features/transcript/types/transcript-types.ts
export type TranscriptStudent = {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
};

export type TranscriptSubject = {
  code: string | null;
  title: string | null;
  units: number | null;
  percentage: number | null;
  equivalent_grade: number | null;
  remarks: string | null;
};

export type TranscriptSemester = {
  academic_year: {
    id: number | null;
    name: string | null;
  };
  semester: {
    id: number | null;
    name: string | null;
  };
  subjects: TranscriptSubject[];
  semester_gwa: number | null;
};

export type Transcript = {
  student: TranscriptStudent;
  semesters: TranscriptSemester[];
  cumulative_gwa: number | null;
};
