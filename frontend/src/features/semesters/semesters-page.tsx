// frontend/src/features/semesters/semesters-page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { academicYearService } from "../academic-years/academic-year-service";
import type { AcademicYear } from "../academic-years/types/academic-year-types";
import { DeleteSemesterDialog } from "./components/delete-semester-dialog";
import { Pagination } from "./components/pagination";
import { SemesterFormDialog } from "./components/semester-form-dialog";
import { SemestersTable } from "./components/semesters-table";
import { semesterService } from "./semester-service";
import { useSemesters } from "./hooks/use-semesters";
import type { Semester, SemesterFormValues, SemesterPayload } from "./types/semester-types";

export function SemestersPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const { semesters, pagination, isLoading, error, refresh } = useSemesters(page);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [academicYearsError, setAcademicYearsError] = useState<string | null>(null);
  const [isAcademicYearsLoading, setIsAcademicYearsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const loadAcademicYears = useCallback(async () => {
    setIsAcademicYearsLoading(true);
    setAcademicYearsError(null);
    try {
      const result = await academicYearService.list({ page: 1 });
      setAcademicYears(result.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load academic years.";
      setAcademicYearsError(message);
    } finally {
      setIsAcademicYearsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAcademicYears();
  }, [loadAcademicYears]);

  const academicYearOptions = useMemo(
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

  const editValues: SemesterFormValues | undefined = useMemo(() => {
    if (!selectedSemester) {
      return undefined;
    }
    return {
      name: selectedSemester.name,
      academic_year_id: selectedSemester.academic_year_id.toString(),
      is_current: selectedSemester.is_current ? "true" : "false",
      add_drop_start: selectedSemester.add_drop_start ?? "",
      add_drop_end: selectedSemester.add_drop_end ?? "",
    };
  }, [selectedSemester]);

  const handleCreate = async (payload: SemesterPayload): Promise<void> => {
    setIsSaving(true);
    setWarning(null);
    try {
      await semesterService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: SemesterPayload): Promise<void> => {
    if (!selectedSemester) {
      return;
    }
    setIsSaving(true);
    setWarning(null);
    try {
      await semesterService.update(selectedSemester.id, payload);
      setIsEditOpen(false);
      setSelectedSemester(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedSemester) {
      return;
    }
    setIsDeleting(true);
    setWarning(null);
    try {
      await semesterService.remove(selectedSemester.id);
      setIsDeleteOpen(false);
      setSelectedSemester(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteRequest = (semester: Semester): void => {
    if (semester.is_current) {
      setWarning("Cannot delete the current semester. Set another semester as current first.");
      return;
    }
    setWarning(null);
    setSelectedSemester(semester);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Semesters</h1>
          <p className="text-sm text-slate-600">Manage semester records and status.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Semester
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await refresh();
            await loadAcademicYears();
          }}
          disabled={isLoading || isAcademicYearsLoading}
        >
          {isLoading || isAcademicYearsLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {warning ? (
        <Alert>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AlertDescription>{warning}</AlertDescription>
            <Button type="button" variant="secondary" onClick={() => setWarning(null)}>
              Dismiss
            </Button>
          </div>
        </Alert>
      ) : null}

      {academicYearsError ? (
        <Alert>
          <AlertDescription>{academicYearsError}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <SemestersTable
        semesters={semesters}
        isLoading={isLoading}
        academicYearLookup={academicYearLookup}
        onEdit={(semester) => {
          setSelectedSemester(semester);
          setIsEditOpen(true);
          setWarning(null);
        }}
        onDelete={handleDeleteRequest}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />

      <SemesterFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setWarning(null);
          }
        }}
        title="Create Semester"
        isSubmitting={isSaving}
        academicYearOptions={academicYearOptions}
        isAcademicYearsLoading={isAcademicYearsLoading}
        onSubmit={handleCreate}
      />

      <SemesterFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedSemester(null);
            setWarning(null);
          }
        }}
        title="Edit Semester"
        initialValues={editValues}
        isSubmitting={isSaving}
        academicYearOptions={academicYearOptions}
        isAcademicYearsLoading={isAcademicYearsLoading}
        onSubmit={handleEdit}
      />

      <DeleteSemesterDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedSemester(null);
          }
        }}
        semester={selectedSemester}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
