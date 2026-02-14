// frontend/src/features/enrollments/enrollment-detail-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { academicYearService } from "../academic-years/academic-year-service";
import type { AcademicYear } from "../academic-years/types/academic-year-types";
import { courseOfferingService } from "../course-offerings/course-offering-service";
import type { CourseOffering } from "../course-offerings/types/course-offering-types";
import { programService } from "../programs/program-service";
import type { Program } from "../programs/program-types";
import { semesterService } from "../semesters/semester-service";
import type { Semester } from "../semesters/types/semester-types";
import { studentService } from "../students/student-service";
import type { Student } from "../students/types/student-types";
import { subjectService } from "../subjects/subject-service";
import type { Subject } from "../subjects/types/subject-types";
import { EnrollmentAttachDialog } from "./components/enrollment-attach-dialog";
import { EnrollmentSubjectsTable } from "./components/enrollment-subjects-table";
import { enrollmentService } from "./enrollment-service";
import { enrollmentSubjectService } from "./enrollment-subject-service";
import type { Enrollment, EnrollmentCor } from "./types/enrollment-types";

type EnrollmentDetailPageProps = {
  enrollmentId: number;
};

type ValidationErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

type AddDropStatus = "open" | "closed" | "missing" | "unknown";

const formatDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }
  const [datePart] = value.split("T");
  return datePart || "-";
};

const normalizeDate = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  const [datePart] = value.split("T");
  return datePart || null;
};

const statusStyles: Record<Enrollment["status"], string> = {
  enrolled: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
};

const statusLabels: Record<Enrollment["status"], string> = {
  enrolled: "Enrolled",
  cancelled: "Cancelled",
  completed: "Completed",
};

const addDropStatusStyles: Record<AddDropStatus, string> = {
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-amber-100 text-amber-700",
  missing: "bg-slate-100 text-slate-600",
  unknown: "bg-slate-100 text-slate-600",
};

const addDropStatusLabels: Record<AddDropStatus, string> = {
  open: "Add/Drop Open",
  closed: "Add/Drop Closed",
  missing: "Add/Drop Not Set",
  unknown: "Add/Drop Unknown",
};

export function EnrollmentDetailPage({
  enrollmentId,
}: EnrollmentDetailPageProps): JSX.Element {
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [cor, setCor] = useState<EnrollmentCor | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courseOfferings, setCourseOfferings] = useState<CourseOffering[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCorLoading, setIsCorLoading] = useState(true);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [corError, setCorError] = useState<string | null>(null);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [isDetaching, setIsDetaching] = useState(false);
  const [detachError, setDetachError] = useState<string | null>(null);

  const loadEnrollment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.get(enrollmentId);
      setEnrollment(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load enrollment.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId]);

  const loadCor = useCallback(async () => {
    setIsCorLoading(true);
    setCorError(null);
    try {
      const result = await enrollmentService.cor(enrollmentId);
      setCor(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load enrollment details.";
      setCorError(message);
    } finally {
      setIsCorLoading(false);
    }
  }, [enrollmentId]);

  const loadReferenceData = useCallback(async () => {
    setIsReferenceLoading(true);
    setReferenceError(null);
    try {
      const [studentsResult, programsResult, yearsResult, semestersResult, offeringsResult, subjectsResult] =
        await Promise.all([
          studentService.list({ page: 1 }),
          programService.list({ page: 1 }),
          academicYearService.list({ page: 1 }),
          semesterService.list({ page: 1 }),
          courseOfferingService.list({ page: 1 }),
          subjectService.list({ page: 1 }),
        ]);

      setStudents(studentsResult.data);
      setPrograms(programsResult.data);
      setAcademicYears(yearsResult.data);
      setSemesters(semestersResult.data);
      setCourseOfferings(offeringsResult.data);
      setSubjects(subjectsResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reference data.";
      setReferenceError(message);
    } finally {
      setIsReferenceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEnrollment();
    void loadCor();
    void loadReferenceData();
  }, [loadEnrollment, loadCor, loadReferenceData]);

  const subjectLookup = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]));
  }, [subjects]);

  const studentLookup = useMemo(() => {
    return new Map(
      students.map((student) => [
        student.id,
        `${student.student_number} - ${student.last_name}, ${student.first_name}`,
      ]),
    );
  }, [students]);

  const programLookup = useMemo(() => {
    return new Map(programs.map((program) => [program.id, program.name]));
  }, [programs]);

  const academicYearLookup = useMemo(() => {
    return new Map(academicYears.map((year) => [year.id, year.name]));
  }, [academicYears]);

  const semesterLookup = useMemo(() => {
    return new Map(semesters.map((semester) => [semester.id, semester.name]));
  }, [semesters]);

  const addDropWindow = useMemo(() => {
    if (!enrollment) {
      return {
        status: "unknown",
        message: null,
        start: null,
        end: null,
      } as const;
    }

    const semester = semesters.find((item) => item.id === enrollment.semester_id);
    const startRaw = normalizeDate(semester?.add_drop_start ?? null);
    const endRaw = normalizeDate(semester?.add_drop_end ?? null);

    if (!startRaw || !endRaw) {
      return {
        status: "missing",
        message: "Add/drop window is not configured for this semester.",
        start: startRaw,
        end: endRaw,
      } as const;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(`${startRaw}T00:00:00`);
    const endDate = new Date(`${endRaw}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        status: "missing",
        message: "Add/drop window is not configured for this semester.",
        start: startRaw,
        end: endRaw,
      } as const;
    }

    const isOpen = today >= startDate && today <= endDate;
    return {
      status: isOpen ? "open" : "closed",
      message: isOpen
        ? `Add/drop window is open until ${endRaw}.`
        : `Add/drop window closed (${startRaw} to ${endRaw}).`,
      start: startRaw,
      end: endRaw,
    } as const;
  }, [enrollment, semesters]);

  const attachOptions = useMemo(() => {
    if (!enrollment) {
      return [];
    }

    return courseOfferings
      .filter((offering) =>
        offering.academic_year_id === enrollment.academic_year_id &&
        offering.semester_id === enrollment.semester_id &&
        offering.is_active,
      )
      .map((offering) => {
        const subject = subjectLookup.get(offering.subject_id);
        const subjectLabel = subject
          ? `${subject.code} - ${subject.title}`
          : "Unknown subject";
        const units = subject?.units ?? 0;
        const availableSlots = Math.max(offering.max_slots - offering.slots_taken, 0);
        const label = `${subjectLabel} • Sec ${offering.section} • ${units} units • ${availableSlots} slots left`;

        return {
          value: offering.id.toString(),
          label,
          availableSlots,
          isFull: availableSlots <= 0,
        };
      });
  }, [courseOfferings, enrollment, subjectLookup]);

  const detailSummary = useMemo(() => {
    const studentName = cor?.student
      ? `${cor.student.student_number ?? ""} - ${cor.student.last_name ?? ""}, ${cor.student.first_name ?? ""}`.trim()
      : enrollment
        ? studentLookup.get(enrollment.student_id) ?? "Unknown"
        : "";

    const programName = cor?.program?.name
      ? cor.program.name
      : enrollment
        ? programLookup.get(enrollment.program_id) ?? "Unknown"
        : "";

    const academicYearName = cor?.academic_year?.name
      ? cor.academic_year.name
      : enrollment
        ? academicYearLookup.get(enrollment.academic_year_id) ?? "Unknown"
        : "";

    const semesterName = cor?.semester?.name
      ? cor.semester.name
      : enrollment
        ? semesterLookup.get(enrollment.semester_id) ?? "Unknown"
        : "";

    return {
      studentName,
      programName,
      academicYearName,
      semesterName,
    };
  }, [cor, enrollment, studentLookup, programLookup, academicYearLookup, semesterLookup]);

  const handleAttach = async (courseOfferingId: number): Promise<void> => {
    if (!enrollment) {
      return;
    }
    setIsAttaching(true);
    setAttachError(null);
    try {
      await enrollmentSubjectService.attach({
        enrollment_id: enrollment.id,
        course_offering_id: courseOfferingId,
      });
      setIsAttachOpen(false);
      await loadCor();
      await loadEnrollment();
    } catch (err) {
      if (axios.isAxiosError<ValidationErrorResponse>(err)) {
        const errors = err.response?.data?.errors;
        const fieldMessage =
          errors?.course_offering_id?.[0] ?? errors?.add_drop_window?.[0];
        const fallbackMessage = err.response?.data?.message;
        setAttachError(fieldMessage || fallbackMessage || "Failed to attach course offering.");
      } else {
        const message = err instanceof Error ? err.message : "Failed to attach course offering.";
        setAttachError(message);
      }
    } finally {
      setIsAttaching(false);
    }
  };

  const handleDetach = async (enrollmentSubjectId: number): Promise<void> => {
    setIsDetaching(true);
    setDetachError(null);
    try {
      await enrollmentSubjectService.remove(enrollmentSubjectId);
      await loadCor();
      await loadEnrollment();
    } catch (err) {
      if (axios.isAxiosError<ValidationErrorResponse>(err)) {
        const errors = err.response?.data?.errors;
        const fieldMessage = errors?.add_drop_window?.[0];
        const fallbackMessage = err.response?.data?.message;
        setDetachError(fieldMessage || fallbackMessage || "Failed to remove subject.");
      } else {
        const message = err instanceof Error ? err.message : "Failed to remove subject.";
        setDetachError(message);
      }
    } finally {
      setIsDetaching(false);
    }
  };

  const statusBadge = enrollment ? (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[enrollment.status]}`}
    >
      {statusLabels[enrollment.status]}
    </span>
  ) : null;

  const addDropBadge = enrollment ? (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${addDropStatusStyles[addDropWindow.status]}`}
    >
      {addDropStatusLabels[addDropWindow.status]}
    </span>
  ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">Enrollment Detail</h1>
            {statusBadge}
            {addDropBadge}
          </div>
          <p className="text-sm text-slate-600">
            {detailSummary.studentName || "Student"} · {detailSummary.programName || "Program"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate({ to: "/enrollments" })}>
            Back to Enrollments
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: `/enrollments/${enrollmentId}/assessment` })}
            disabled={!enrollment}
          >
            View Assessment
          </Button>
          <Button
            type="button"
            onClick={() => setIsAttachOpen(true)}
            disabled={isReferenceLoading || !enrollment || addDropWindow.status !== "open"}
          >
            Attach Course Offering
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Term Details</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700">Academic Year:</span>{" "}
              {detailSummary.academicYearName || "-"}
            </div>
            <div>
              <span className="font-medium text-slate-700">Semester:</span>{" "}
              {detailSummary.semesterName || "-"}
            </div>
            <div>
              <span className="font-medium text-slate-700">Year Level:</span>{" "}
              {enrollment?.year_level ?? "-"}
            </div>
            <div>
              <span className="font-medium text-slate-700">Add/Drop Window:</span>{" "}
              {addDropWindow.start && addDropWindow.end
                ? `${formatDate(addDropWindow.start)} to ${formatDate(addDropWindow.end)}`
                : "-"}
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-700">Unit Summary</h2>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {cor?.total_units ?? enrollment?.total_units ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">Total units for this enrollment</p>
        </div>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {corError ? (
        <Alert>
          <AlertDescription>{corError}</AlertDescription>
        </Alert>
      ) : null}

      {referenceError ? (
        <Alert>
          <AlertDescription>{referenceError}</AlertDescription>
        </Alert>
      ) : null}

      {detachError ? (
        <Alert>
          <AlertDescription>{detachError}</AlertDescription>
        </Alert>
      ) : null}

      <EnrollmentSubjectsTable
        subjects={cor?.subjects ?? []}
        isLoading={isCorLoading || isLoading}
        isDetaching={isDetaching}
        onDetach={handleDetach}
        disableDetach={addDropWindow.status !== "open"}
      />

      <EnrollmentAttachDialog
        open={isAttachOpen}
        onOpenChange={(open) => {
          setIsAttachOpen(open);
          if (!open) {
            setAttachError(null);
          }
        }}
        isSubmitting={isAttaching}
        options={attachOptions}
        errorMessage={attachError}
        windowMessage={addDropWindow.message}
        isWindowOpen={addDropWindow.status === "open"}
        onSubmit={handleAttach}
      />
    </div>
  );
}
