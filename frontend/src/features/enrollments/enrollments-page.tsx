// frontend/src/features/enrollments/enrollments-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { academicYearService } from "../academic-years/academic-year-service";
import type { AcademicYear } from "../academic-years/types/academic-year-types";
import { programService } from "../programs/program-service";
import type { Program } from "../programs/program-types";
import { semesterService } from "../semesters/semester-service";
import type { Semester } from "../semesters/types/semester-types";
import { studentService } from "../students/student-service";
import type { Student } from "../students/types/student-types";
import { DeleteEnrollmentDialog } from "./components/delete-enrollment-dialog";
import { EnrollmentFormDialog } from "./components/enrollment-form-dialog";
import { EnrollmentsTable } from "./components/enrollments-table";
import { Pagination } from "./components/pagination";
import { enrollmentService } from "./enrollment-service";
import { useEnrollments } from "./hooks/use-enrollments";
import type {
  Enrollment,
  EnrollmentFormValues,
  EnrollmentPayload,
} from "./types/enrollment-types";

type Option = {
  value: string;
  label: string;
};

type StudentOption = Option & {
  programId: number | null;
};

type SemesterOption = Option & {
  academicYearId: number;
};

export function EnrollmentsPage(): JSX.Element {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { enrollments, pagination, isLoading, error, refresh } = useEnrollments(page);

  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const loadReferenceData = useCallback(async () => {
    setIsReferenceLoading(true);
    setReferenceError(null);
    try {
      const [studentsResult, programsResult, semestersResult, academicYearsResult] =
        await Promise.all([
          studentService.list({ page: 1 }),
          programService.list({ page: 1 }),
          semesterService.list({ page: 1 }),
          academicYearService.list({ page: 1 }),
        ]);

      setStudents(studentsResult.data);
      setPrograms(programsResult.data);
      setSemesters(semestersResult.data);
      setAcademicYears(academicYearsResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reference data.";
      setReferenceError(message);
    } finally {
      setIsReferenceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  const studentOptions = useMemo<StudentOption[]>(
    () =>
      students.map((student) => ({
        value: student.id.toString(),
        programId: student.program_id,
        label: `${student.student_number} - ${student.last_name}, ${student.first_name}`,
      })),
    [students],
  );

  const programLookup = useMemo(() => {
    return new Map(programs.map((program) => [program.id, program.name]));
  }, [programs]);

  const academicYearOptions = useMemo<Option[]>(
    () =>
      academicYears.map((year) => ({
        value: year.id.toString(),
        label: year.name,
      })),
    [academicYears],
  );

  const academicYearLookup = useMemo(() => {
    return new Map(academicYears.map((year) => [year.id, year.name]));
  }, [academicYears]);

  const semesterOptions = useMemo<SemesterOption[]>(
    () =>
      semesters.map((semester) => ({
        value: semester.id.toString(),
        academicYearId: semester.academic_year_id,
        label: semester.name,
      })),
    [semesters],
  );

  const semesterLookup = useMemo(() => {
    return new Map(semesters.map((semester) => [semester.id, semester.name]));
  }, [semesters]);

  const studentLookup = useMemo(() => {
    return new Map(
      students.map((student) => [
        student.id,
        `${student.student_number} - ${student.last_name}, ${student.first_name}`,
      ]),
    );
  }, [students]);

  const editValues: EnrollmentFormValues | undefined = useMemo(() => {
    if (!selectedEnrollment) {
      return undefined;
    }
    return {
      student_id: selectedEnrollment.student_id.toString(),
      academic_year_id: selectedEnrollment.academic_year_id.toString(),
      semester_id: selectedEnrollment.semester_id.toString(),
      year_level: selectedEnrollment.year_level.toString(),
      status: selectedEnrollment.status,
    };
  }, [selectedEnrollment]);

  const handleCreate = async (payload: EnrollmentPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await enrollmentService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: EnrollmentPayload): Promise<void> => {
    if (!selectedEnrollment) {
      return;
    }
    setIsSaving(true);
    try {
      await enrollmentService.update(selectedEnrollment.id, payload);
      setIsEditOpen(false);
      setSelectedEnrollment(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedEnrollment) {
      return;
    }
    setIsDeleting(true);
    try {
      await enrollmentService.remove(selectedEnrollment.id);
      setIsDeleteOpen(false);
      setSelectedEnrollment(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Enrollments</h1>
          <p className="text-sm text-slate-600">Manage student enrollments by term.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Enrollment
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await refresh();
            await loadReferenceData();
          }}
          disabled={isLoading || isReferenceLoading}
        >
          {isLoading || isReferenceLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {referenceError ? (
        <Alert>
          <AlertDescription>{referenceError}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <EnrollmentsTable
        enrollments={enrollments}
        isLoading={isLoading}
        studentLookup={studentLookup}
        programLookup={programLookup}
        academicYearLookup={academicYearLookup}
        semesterLookup={semesterLookup}
        onView={(enrollment) => {
          navigate({ to: `/enrollments/${enrollment.id}` });
        }}
        onAssessment={(enrollment) => {
          navigate({ to: `/enrollments/${enrollment.id}/assessment` });
        }}
        onEdit={(enrollment) => {
          setSelectedEnrollment(enrollment);
          setIsEditOpen(true);
        }}
        onDelete={(enrollment) => {
          setSelectedEnrollment(enrollment);
          setIsDeleteOpen(true);
        }}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />

      <EnrollmentFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Enrollment"
        isSubmitting={isSaving}
        studentOptions={studentOptions}
        programLookup={programLookup}
        academicYearOptions={academicYearOptions}
        semesterOptions={semesterOptions}
        isReferenceLoading={isReferenceLoading}
        onSubmit={handleCreate}
      />

      <EnrollmentFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedEnrollment(null);
          }
        }}
        title="Edit Enrollment"
        initialValues={editValues}
        isSubmitting={isSaving}
        studentOptions={studentOptions}
        programLookup={programLookup}
        academicYearOptions={academicYearOptions}
        semesterOptions={semesterOptions}
        isReferenceLoading={isReferenceLoading}
        onSubmit={handleEdit}
      />

      <DeleteEnrollmentDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedEnrollment(null);
          }
        }}
        enrollment={selectedEnrollment}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
