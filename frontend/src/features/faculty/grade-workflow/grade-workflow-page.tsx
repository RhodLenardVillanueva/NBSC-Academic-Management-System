// frontend/src/features/faculty/grade-workflow/grade-workflow-page.tsx
// Faculty grade workflow pages for encoding and reviewing grades.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { apiClient } from "../../../app/api/api-client";
import type { ApiResponse } from "../../../shared/types/api";
import { useAuthStore } from "../../../app/auth/auth-store";
import { Pagination } from "../components/pagination";
import { CourseOfferingList } from "./course-offering-list";
import { GradeSummaryPanel } from "./grade-summary-panel";
import { StudentGradeTable } from "./student-grade-table";
import { useCourseOfferings } from "./hooks/use-course-offerings";
import { useCourseStudents } from "./hooks/use-course-students";
import { useGradeActions } from "./hooks/use-grade-actions";
import type {
  CourseOfferingStudentsResponse,
  GradeSubmissionResponse,
  OfferingStatus,
  StudentGrade,
} from "./types/grade-types";

type GradeWorkflowPageProps = {
  offeringId?: number;
};

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type DraftStatus = {
  hasPendingChanges: boolean;
  hasInvalid: boolean;
};

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
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

const hasAllScores = (student: StudentGrade): boolean => {
  return (
    student.quizzes !== null &&
    student.quizzes !== "" &&
    student.projects !== null &&
    student.projects !== "" &&
    student.participation !== null &&
    student.participation !== "" &&
    student.major_exams !== null &&
    student.major_exams !== ""
  );
};

const mergeStudent = (
  student: StudentGrade,
  updated: GradeSubmissionResponse,
): StudentGrade => {
  return {
    ...student,
    quizzes: updated.quizzes,
    projects: updated.projects,
    participation: updated.participation,
    major_exams: updated.major_exams,
    final_numeric_grade: updated.final_numeric_grade,
    grade_point: updated.grade_point,
    remarks: updated.remarks,
    is_submitted: updated.is_submitted,
    submitted_at: updated.submitted_at,
  };
};

export function GradeWorkflowPage({ offeringId }: GradeWorkflowPageProps): JSX.Element {
  if (offeringId !== undefined) {
    return <GradeOfferingDetail offeringId={offeringId} />;
  }

  return <GradeOfferingListPage />;
}

function GradeOfferingListPage(): JSX.Element {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { courseOfferings, pagination, isLoading, error, refresh } =
    useCourseOfferings(page);
  const [statusByOffering, setStatusByOffering] = useState<Record<number, OfferingStatus>>(
    {},
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (courseOfferings.length === 0) {
      setStatusByOffering({});
      return;
    }

    let isActive = true;

    const initialStatus: Record<number, OfferingStatus> = {};
    courseOfferings.forEach((offering) => {
      initialStatus[offering.id] = "loading";
    });
    setStatusByOffering(initialStatus);

    const loadStatuses = async () => {
      const results = await Promise.all(
        courseOfferings.map(async (offering) => {
          try {
            const response = await apiClient.get<
              ApiResponse<CourseOfferingStudentsResponse>
            >(`/course-offerings/${offering.id}/students`);
            const data = ensureSuccess(response.data);
            const hasStudents = data.students.length > 0;
            const allSubmitted =
              hasStudents && data.students.every((student) => student.is_submitted);
            return [offering.id, allSubmitted ? "submitted" : "open"] as const;
          } catch {
            return [offering.id, "open"] as const;
          }
        }),
      );

      if (!isActive) {
        return;
      }

      const nextStatus: Record<number, OfferingStatus> = {};
      results.forEach(([id, status]) => {
        nextStatus[id] = status;
      });

      setStatusByOffering((prev) => ({
        ...prev,
        ...nextStatus,
      }));
    };

    void loadStatuses();

    return () => {
      isActive = false;
    };
  }, [courseOfferings, isLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Grade Encoding</h1>
          <p className="text-sm text-slate-600">
            View assigned course offerings and encode student grades.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="px-4"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <CourseOfferingList
        offerings={courseOfferings}
        statusByOffering={statusByOffering}
        isLoading={isLoading}
        onSelect={(id) => navigate({ to: `/faculty/grades/${id}` })}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}

function GradeOfferingDetail({ offeringId }: { offeringId: number }): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const roles = user?.roles?.map((role) => role.name) ?? [];
  const isAdminOrRegistrar = roles.includes("Admin") || roles.includes("Registrar");
  const isFaculty = roles.includes("Faculty");
  const isReadOnly = !isFaculty || isAdminOrRegistrar;

  const { data, isLoading, error, refresh } = useCourseStudents(offeringId);
  const { saveGrade, submitGrade, isSaving, submittingIds } = useGradeActions();

  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>({
    hasPendingChanges: false,
    hasInvalid: false,
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) {
      setStudents([]);
      return;
    }
    setStudents(data.students);
  }, [data]);

  useEffect(() => {
    return () => {
      if (toastRef.current !== null) {
        window.clearTimeout(toastRef.current);
      }
    };
  }, []);

  const showToast = useCallback((variant: ToastState["variant"], message: string) => {
    setToast({ variant, message });
    if (toastRef.current !== null) {
      window.clearTimeout(toastRef.current);
    }
    toastRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const submittedCount = useMemo(
    () => students.filter((student) => student.is_submitted).length,
    [students],
  );

  const isAllSubmitted = students.length > 0 && submittedCount === students.length;

  const latestSubmittedAt = useMemo(() => {
    const submittedDates = students
      .map((student) => student.submitted_at)
      .filter((value): value is string => Boolean(value));

    if (submittedDates.length === 0) {
      return null;
    }

    return submittedDates.reduce((latest, current) => {
      return new Date(current) > new Date(latest) ? current : latest;
    });
  }, [students]);

  const canSubmit =
    !isReadOnly &&
    !isAllSubmitted &&
    students.length > 0 &&
    !draftStatus.hasInvalid &&
    !draftStatus.hasPendingChanges &&
    students.every(hasAllScores);

  const isSubmitting = submittingIds.length > 0;

  const handleStudentUpdate = useCallback((updated: GradeSubmissionResponse) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.enrollment_subject_id === updated.id
          ? mergeStudent(student, updated)
          : student,
      ),
    );
  }, []);

  const handleSubmitAll = useCallback(async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    const pending = students.filter((student) => !student.is_submitted);

    if (pending.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      pending.map((student) => submitGrade(student.enrollment_subject_id)),
    );

    let hasFailures = false;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        handleStudentUpdate(result.value);
      } else {
        hasFailures = true;
        const student = pending[index];
        const message = getErrorMessage(
          result.reason,
          `Failed to submit grades for ${student.student.student_number ?? "student"}.`,
        );
        showToast("error", message);
      }
    });

    if (!hasFailures) {
      showToast("success", "Grades submitted successfully.");
    }
  }, [canSubmit, handleStudentUpdate, isSubmitting, showToast, students, submitGrade]);

  const courseOffering = data?.course_offering;

  return (
    <div className="relative space-y-6">
      {toast ? (
        <div
          className={[
            "fixed right-6 top-6 z-50 rounded-md border px-4 py-3 text-sm shadow",
            toast.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Grade Encoding</h1>
          <p className="text-sm text-slate-600">
            Encode grades for the selected course offering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="px-4"
            onClick={() => navigate({ to: "/faculty/grades" })}
          >
            Back to Offerings
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="px-4"
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-slate-500">Course Offering</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {courseOffering?.subject?.code ?? "-"} - {courseOffering?.subject?.title ?? "-"}
              </h2>
              <p className="text-sm text-slate-600">
                Section {courseOffering?.section ?? "-"} - {courseOffering?.semester?.name ?? "-"}
                {courseOffering?.academic_year?.name
                  ? ` (${courseOffering.academic_year.name})`
                  : ""}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Instructor: {courseOffering?.instructor ?? "-"}
            </div>
          </div>
          {isReadOnly ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Read-only access. Grades can only be edited by Faculty.
            </div>
          ) : null}
        </div>

        <GradeSummaryPanel
          totalStudents={students.length}
          submittedCount={submittedCount}
          isAllSubmitted={isAllSubmitted}
          submittedAt={latestSubmittedAt}
          isReadOnly={isReadOnly}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          onSubmit={handleSubmitAll}
        />
      </div>

      <StudentGradeTable
        students={students}
        isLoading={isLoading}
        isReadOnly={isReadOnly}
        isSaving={isSaving}
        onSaveGrade={saveGrade}
        onStudentUpdate={handleStudentUpdate}
        onToast={showToast}
        onStatusChange={setDraftStatus}
      />
    </div>
  );
}
