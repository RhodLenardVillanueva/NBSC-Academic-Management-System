// frontend/src/features/course-offerings/course-offerings-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { academicYearService } from "../academic-years/academic-year-service";
import type { AcademicYear } from "../academic-years/types/academic-year-types";
import { instructorService } from "../instructors/instructor-service";
import type { Instructor } from "../instructors/types/instructor-types";
import { semesterService } from "../semesters/semester-service";
import type { Semester } from "../semesters/types/semester-types";
import { subjectService } from "../subjects/subject-service";
import type { Subject } from "../subjects/types/subject-types";
import { CourseOfferingFormDialog } from "./components/course-offering-form-dialog";
import { CourseOfferingsTable } from "./components/course-offerings-table";
import { DeleteCourseOfferingDialog } from "./components/delete-course-offering-dialog";
import { Pagination } from "./components/pagination";
import { courseOfferingService } from "./course-offering-service";
import { useCourseOfferings } from "./hooks/use-course-offerings";
import type {
  CourseOffering,
  CourseOfferingFormValues,
  CourseOfferingPayload,
} from "./types/course-offering-types";

type Option = {
  value: string;
  label: string;
};

type SemesterOption = Option & {
  academicYearId: number;
};

export function CourseOfferingsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const { courseOfferings, pagination, isLoading, error, refresh } =
    useCourseOfferings(page);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [isReferenceLoading, setIsReferenceLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCourseOffering, setSelectedCourseOffering] =
    useState<CourseOffering | null>(null);

  const loadReferenceData = useCallback(async () => {
    setIsReferenceLoading(true);
    setReferenceError(null);
    try {
      const [subjectsResult, instructorsResult, semestersResult, academicYearsResult] =
        await Promise.all([
          subjectService.list({ page: 1 }),
          instructorService.list({ page: 1 }),
          semesterService.list({ page: 1 }),
          academicYearService.list({ page: 1 }),
        ]);

      setSubjects(subjectsResult.data);
      setInstructors(instructorsResult.data);
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

  const subjectOptions = useMemo<Option[]>(
    () =>
      subjects.map((subject) => ({
        value: subject.id.toString(),
        label: `${subject.code} - ${subject.title}`,
      })),
    [subjects],
  );

  const instructorOptions = useMemo<Option[]>(
    () =>
      instructors.map((instructor) => ({
        value: instructor.id.toString(),
        label: instructor.full_name || `${instructor.first_name} ${instructor.last_name}`,
      })),
    [instructors],
  );

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

  const semesterOptions = useMemo<SemesterOption[]>(() => {
    return semesters.map((semester) => ({
      value: semester.id.toString(),
      academicYearId: semester.academic_year_id,
      label: `${semester.name} (${academicYearLookup.get(semester.academic_year_id) ?? "Unknown"})`,
    }));
  }, [semesters, academicYearLookup]);

  const subjectLookup = useMemo(() => {
    return new Map(
      subjects.map((subject) => [subject.id, `${subject.code} - ${subject.title}`]),
    );
  }, [subjects]);

  const instructorLookup = useMemo(() => {
    return new Map(
      instructors.map((instructor) => [
        instructor.id,
        instructor.full_name || `${instructor.first_name} ${instructor.last_name}`,
      ]),
    );
  }, [instructors]);

  const semesterLookup = useMemo(() => {
    return new Map(semesters.map((semester) => [semester.id, semester.name]));
  }, [semesters]);

  const editValues: CourseOfferingFormValues | undefined = useMemo(() => {
    if (!selectedCourseOffering) {
      return undefined;
    }
    return {
      subject_id: selectedCourseOffering.subject_id.toString(),
      instructor_id: selectedCourseOffering.instructor_id.toString(),
      academic_year_id: selectedCourseOffering.academic_year_id.toString(),
      semester_id: selectedCourseOffering.semester_id.toString(),
      section: selectedCourseOffering.section,
      schedule: selectedCourseOffering.schedule ?? "",
      room: selectedCourseOffering.room ?? "",
      max_slots: selectedCourseOffering.max_slots.toString(),
      slots_taken: selectedCourseOffering.slots_taken.toString(),
      is_active: selectedCourseOffering.is_active ? "true" : "false",
    };
  }, [selectedCourseOffering]);

  const handleCreate = async (payload: CourseOfferingPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await courseOfferingService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: CourseOfferingPayload): Promise<void> => {
    if (!selectedCourseOffering) {
      return;
    }
    setIsSaving(true);
    try {
      await courseOfferingService.update(selectedCourseOffering.id, payload);
      setIsEditOpen(false);
      setSelectedCourseOffering(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedCourseOffering) {
      return;
    }
    setIsDeleting(true);
    try {
      await courseOfferingService.remove(selectedCourseOffering.id);
      setIsDeleteOpen(false);
      setSelectedCourseOffering(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Course Offerings</h1>
          <p className="text-sm text-slate-600">Manage subject offerings per semester.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Course Offering
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

      <CourseOfferingsTable
        courseOfferings={courseOfferings}
        isLoading={isLoading}
        subjectLookup={subjectLookup}
        instructorLookup={instructorLookup}
        semesterLookup={semesterLookup}
        academicYearLookup={academicYearLookup}
        onEdit={(courseOffering) => {
          setSelectedCourseOffering(courseOffering);
          setIsEditOpen(true);
        }}
        onDelete={(courseOffering) => {
          setSelectedCourseOffering(courseOffering);
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

      <CourseOfferingFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Course Offering"
        isSubmitting={isSaving}
        subjectOptions={subjectOptions}
        instructorOptions={instructorOptions}
        academicYearOptions={academicYearOptions}
        semesterOptions={semesterOptions}
        isReferenceLoading={isReferenceLoading}
        onSubmit={handleCreate}
      />

      <CourseOfferingFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedCourseOffering(null);
          }
        }}
        title="Edit Course Offering"
        initialValues={editValues}
        isSubmitting={isSaving}
        subjectOptions={subjectOptions}
        instructorOptions={instructorOptions}
        academicYearOptions={academicYearOptions}
        semesterOptions={semesterOptions}
        isReferenceLoading={isReferenceLoading}
        onSubmit={handleEdit}
      />

      <DeleteCourseOfferingDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedCourseOffering(null);
          }
        }}
        courseOffering={selectedCourseOffering}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
