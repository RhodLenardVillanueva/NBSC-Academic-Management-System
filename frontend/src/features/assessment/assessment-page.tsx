// frontend/src/features/assessment/assessment-page.tsx
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
import { EnrollmentsTable } from "../enrollments/components/enrollments-table";
import { Pagination } from "../enrollments/components/pagination";
import { useEnrollments } from "../enrollments/hooks/use-enrollments";

export function AssessmentPage(): JSX.Element {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { enrollments, pagination, isLoading, error, refresh } = useEnrollments(page);

  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);

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
      const message =
        err instanceof Error ? err.message : "Failed to load reference data.";
      setReferenceError(message);
    } finally {
      setIsReferenceLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  const programLookup = useMemo(() => {
    return new Map(programs.map((program) => [program.id, program.name]));
  }, [programs]);

  const academicYearLookup = useMemo(() => {
    return new Map(academicYears.map((year) => [year.id, year.name]));
  }, [academicYears]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assessment / Billing</h1>
          <p className="text-sm text-slate-600">
            View official assessment of fees per enrollment.
          </p>
        </div>
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
        onAssessment={(enrollment) => {
          navigate({ to: `/enrollments/${enrollment.id}/assessment` });
        }}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />
    </div>
  );
}
