// frontend/src/features/programs/programs-page.tsx
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { DeleteProgramDialog } from "./delete-program-dialog";
import { ProgramFormDialog } from "./program-form";
import { ProgramsTable } from "./program-table";
import { programService } from "./program-service";
import { usePrograms } from "./use-programs";
import type { Program, ProgramFormValues, ProgramPayload } from "./program-types";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
};

function ProgramsPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  isLoading,
}: PaginationProps): JSX.Element {
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-600">
        Page {currentPage} of {totalPages} - {totalItems} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoBack || isLoading}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoForward || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function ProgramsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const { programs, pagination, isLoading, error, refresh } = usePrograms(page);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const editValues: ProgramFormValues | undefined = useMemo(() => {
    if (!selectedProgram) {
      return undefined;
    }
    return {
      name: selectedProgram.name,
      code: selectedProgram.code,
      description: selectedProgram.description ?? "",
    };
  }, [selectedProgram]);

  const handleCreate = async (payload: ProgramPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await programService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: ProgramPayload): Promise<void> => {
    if (!selectedProgram) {
      return;
    }
    setIsSaving(true);
    try {
      await programService.update(selectedProgram.id, payload);
      setIsEditOpen(false);
      setSelectedProgram(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedProgram) {
      return;
    }
    setIsDeleting(true);
    try {
      await programService.remove(selectedProgram.id);
      setIsDeleteOpen(false);
      setSelectedProgram(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Programs</h1>
          <p className="text-sm text-slate-600">Manage academic programs.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Program
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

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <ProgramsTable
        programs={programs}
        isLoading={isLoading}
        onEdit={(program) => {
          setSelectedProgram(program);
          setIsEditOpen(true);
        }}
        onDelete={(program) => {
          setSelectedProgram(program);
          setIsDeleteOpen(true);
        }}
      />

      <ProgramsPagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />

      <ProgramFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Program"
        isSubmitting={isSaving}
        onSubmit={handleCreate}
      />

      <ProgramFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedProgram(null);
          }
        }}
        title="Edit Program"
        initialValues={editValues}
        isSubmitting={isSaving}
        onSubmit={handleEdit}
      />

      <DeleteProgramDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedProgram(null);
          }
        }}
        program={selectedProgram}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
