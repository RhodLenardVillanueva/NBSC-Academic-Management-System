// frontend/src/features/academic-years/academic-years-page.tsx
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { DeleteAcademicYearDialog } from "./components/delete-academic-year-dialog";
import { AcademicYearFormDialog } from "./components/academic-year-form-dialog";
import { AcademicYearsTable } from "./components/academic-years-table";
import { Pagination } from "./components/pagination";
import { academicYearService } from "./academic-year-service";
import { useAcademicYears } from "./hooks/use-academic-years";
import type {
  AcademicYear,
  AcademicYearFormValues,
  AcademicYearPayload,
} from "./types/academic-year-types";

type YearParts = {
  yearStart: string;
  yearEnd: string;
};

const parseAcademicYear = (name: string): YearParts => {
  const match = name.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (match) {
    return { yearStart: match[1], yearEnd: match[2] };
  }
  return { yearStart: name, yearEnd: "" };
};

export function AcademicYearsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const { academicYears, pagination, isLoading, error, refresh } = useAcademicYears(page);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<AcademicYear | null>(null);

  const editValues: AcademicYearFormValues | undefined = useMemo(() => {
    if (!selectedAcademicYear) {
      return undefined;
    }
    const { yearStart, yearEnd } = parseAcademicYear(selectedAcademicYear.name);
    return {
      year_start: yearStart,
      year_end: yearEnd,
      is_current: selectedAcademicYear.is_active ? "true" : "false",
    };
  }, [selectedAcademicYear]);

  const handleCreate = async (payload: AcademicYearPayload): Promise<void> => {
    setIsSaving(true);
    setWarning(null);
    try {
      await academicYearService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: AcademicYearPayload): Promise<void> => {
    if (!selectedAcademicYear) {
      return;
    }
    setIsSaving(true);
    setWarning(null);
    try {
      await academicYearService.update(selectedAcademicYear.id, payload);
      setIsEditOpen(false);
      setSelectedAcademicYear(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedAcademicYear) {
      return;
    }
    setIsDeleting(true);
    setWarning(null);
    try {
      await academicYearService.remove(selectedAcademicYear.id);
      setIsDeleteOpen(false);
      setSelectedAcademicYear(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteRequest = (academicYear: AcademicYear): void => {
    if (academicYear.is_active) {
      setWarning("Cannot delete the current academic year. Set another year as current first.");
      return;
    }
    setWarning(null);
    setSelectedAcademicYear(academicYear);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Academic Years</h1>
          <p className="text-sm text-slate-600">Manage academic year records.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Academic Year
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={refresh}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
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

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <AcademicYearsTable
        academicYears={academicYears}
        isLoading={isLoading}
        onEdit={(academicYear) => {
          setSelectedAcademicYear(academicYear);
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

      <AcademicYearFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setWarning(null);
          }
        }}
        title="Create Academic Year"
        isSubmitting={isSaving}
        onSubmit={handleCreate}
      />

      <AcademicYearFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedAcademicYear(null);
            setWarning(null);
          }
        }}
        title="Edit Academic Year"
        initialValues={editValues}
        isSubmitting={isSaving}
        onSubmit={handleEdit}
      />

      <DeleteAcademicYearDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedAcademicYear(null);
          }
        }}
        academicYear={selectedAcademicYear}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
