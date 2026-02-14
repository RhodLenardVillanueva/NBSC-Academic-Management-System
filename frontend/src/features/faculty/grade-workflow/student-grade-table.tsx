// frontend/src/features/faculty/grade-workflow/student-grade-table.tsx
// Faculty grade workflow table for student grade encoding.

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import { GradeRow } from "./grade-row";
import type {
  GradeDraft,
  GradeField,
  GradeSubmissionResponse,
  GradeUpdatePayload,
  StudentGrade,
} from "./types/grade-types";

type DraftStatus = {
  hasPendingChanges: boolean;
  hasInvalid: boolean;
};

type StudentGradeTableProps = {
  students: StudentGrade[];
  isLoading: boolean;
  isReadOnly: boolean;
  isSaving: (enrollmentSubjectId: number) => boolean;
  onSaveGrade: (enrollmentSubjectId: number, payload: GradeUpdatePayload) => Promise<GradeSubmissionResponse>;
  onStudentUpdate: (updated: GradeSubmissionResponse) => void;
  onToast: (variant: "success" | "error", message: string) => void;
  onStatusChange?: (status: DraftStatus) => void;
};

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const toDraftValue = (value: string | null): string => {
  if (!value) {
    return "";
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return String(parsed);
};

const toDraft = (student: StudentGrade): GradeDraft => ({
  quizzes: toDraftValue(student.quizzes),
  projects: toDraftValue(student.projects),
  participation: toDraftValue(student.participation),
  major_exams: toDraftValue(student.major_exams),
});

const normalizeValue = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return trimmed;
  }
  return String(parsed);
};

const hasChanges = (draft: GradeDraft, original: GradeDraft): boolean => {
  return (
    normalizeValue(draft.quizzes) !== normalizeValue(original.quizzes) ||
    normalizeValue(draft.projects) !== normalizeValue(original.projects) ||
    normalizeValue(draft.participation) !== normalizeValue(original.participation) ||
    normalizeValue(draft.major_exams) !== normalizeValue(original.major_exams)
  );
};

const validateDraft = (draft: GradeDraft): Partial<Record<GradeField, string>> => {
  const errors: Partial<Record<GradeField, string>> = {};

  (Object.keys(draft) as GradeField[]).forEach((field) => {
    const rawValue = draft[field].trim();
    if (!rawValue) {
      return;
    }
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      errors[field] = "Enter 0-100.";
    }
  });

  return errors;
};

const buildPayload = (draft: GradeDraft): GradeUpdatePayload => {
  const toNumber = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    quizzes: toNumber(draft.quizzes),
    projects: toNumber(draft.projects),
    participation: toNumber(draft.participation),
    major_exams: toNumber(draft.major_exams),
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    const data = error.response?.data;
    const errors = data?.errors ?? {};
    const firstError = Object.values(errors)[0]?.[0];
    if (firstError) {
      return firstError;
    }
    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export function StudentGradeTable({
  students,
  isLoading,
  isReadOnly,
  isSaving,
  onSaveGrade,
  onStudentUpdate,
  onToast,
  onStatusChange,
}: StudentGradeTableProps): JSX.Element {
  const [drafts, setDrafts] = useState<Record<number, GradeDraft>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (students.length === 0) {
      setDrafts({});
    }
  }, [students]);

  const rowStates = useMemo(() => {
    return students.map((student) => {
      const draft = drafts[student.enrollment_subject_id] ?? toDraft(student);
      const original = toDraft(student);
      const errors = validateDraft(draft);
      const dirty = hasChanges(draft, original);
      return {
        student,
        draft,
        errors,
        hasChanges: dirty,
      };
    });
  }, [students, drafts]);

  const draftStatus = useMemo<DraftStatus>(() => {
    const hasPendingChanges = rowStates.some((row) => row.hasChanges);
    const hasInvalid = rowStates.some((row) => Object.keys(row.errors).length > 0);
    return { hasPendingChanges, hasInvalid };
  }, [rowStates]);

  useEffect(() => {
    onStatusChange?.(draftStatus);
  }, [draftStatus, onStatusChange]);

  const updateDraft = (studentId: number, field: GradeField, value: string): void => {
    setDrafts((prev) => {
      const base = prev[studentId] ?? toDraft(
        students.find((entry) => entry.enrollment_subject_id === studentId) ?? {
          enrollment_subject_id: studentId,
          student: {
            id: null,
            student_number: null,
            first_name: null,
            last_name: null,
            program: null,
          },
          quizzes: null,
          projects: null,
          participation: null,
          major_exams: null,
          final_numeric_grade: null,
          grade_point: null,
          remarks: null,
          is_submitted: false,
          submitted_at: null,
        },
      );
      return {
        ...prev,
        [studentId]: {
          ...base,
          [field]: value,
        },
      };
    });
  };

  const clearDraft = (studentId: number): void => {
    setDrafts((prev) => {
      if (!prev[studentId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleSave = async (student: StudentGrade, draft: GradeDraft): Promise<void> => {
    const errors = validateDraft(draft);
    if (Object.keys(errors).length > 0) {
      setLocalError("Fix validation errors before saving.");
      return;
    }

    setLocalError(null);

    try {
      const payload = buildPayload(draft);
      const result = await onSaveGrade(student.enrollment_subject_id, payload);
      onStudentUpdate(result);
      clearDraft(student.enrollment_subject_id);
      onToast("success", "Grade saved.");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to save grade.");
      setLocalError(message);
      onToast("error", message);
    }
  };

  return (
    <div className="space-y-3">
      {localError ? (
        <Alert>
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="max-h-[560px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-slate-50">
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Quizzes (25%)</TableHead>
                <TableHead className="text-right">Projects (25%)</TableHead>
                <TableHead className="text-right">Participation (20%)</TableHead>
                <TableHead className="text-right">Major Exams (30%)</TableHead>
                <TableHead className="text-right">Final Numeric</TableHead>
                <TableHead className="text-right">Grade Point</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    </td>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No students enrolled in this offering.
                  </td>
                </TableRow>
              ) : (
                rowStates.map((row) => (
                  <GradeRow
                    key={row.student.enrollment_subject_id}
                    student={row.student}
                    draft={row.draft}
                    isReadOnly={isReadOnly}
                    isSaving={isSaving(row.student.enrollment_subject_id)}
                    hasChanges={row.hasChanges}
                    errors={row.errors}
                    onChange={(field, value) =>
                      updateDraft(row.student.enrollment_subject_id, field, value)
                    }
                    onSave={() => handleSave(row.student, row.draft)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
