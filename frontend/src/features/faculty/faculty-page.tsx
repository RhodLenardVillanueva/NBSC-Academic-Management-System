// frontend/src/features/faculty/faculty-page.tsx
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { DeleteFacultyDialog } from "./components/delete-faculty-dialog";
import { FacultyFormDialog } from "./components/faculty-form-dialog";
import { FacultyTable } from "./components/faculty-table";
import { Pagination } from "./components/pagination";
import { facultyService } from "./faculty-service";
import { useFaculty } from "./hooks/use-faculty";
import type {
  FacultyFormValues,
  FacultyMember,
  FacultyPayload,
} from "./types/faculty-types";

export function FacultyPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { faculty, pagination, isLoading, error, refresh } = useFaculty(
    page,
    searchTerm,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  const editValues: FacultyFormValues | undefined = useMemo(() => {
    if (!selectedFaculty) {
      return undefined;
    }
    return {
      employee_number: selectedFaculty.employee_number,
      first_name: selectedFaculty.first_name,
      last_name: selectedFaculty.last_name,
      email: selectedFaculty.email ?? "",
      department: selectedFaculty.department ?? "",
      status: selectedFaculty.status,
    };
  }, [selectedFaculty]);

  const handleSearch = (): void => {
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleCreate = async (payload: FacultyPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await facultyService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: FacultyPayload): Promise<void> => {
    if (!selectedFaculty) {
      return;
    }
    setIsSaving(true);
    try {
      await facultyService.update(selectedFaculty.id, payload);
      setIsEditOpen(false);
      setSelectedFaculty(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedFaculty) {
      return;
    }
    setIsDeleting(true);
    try {
      await facultyService.remove(selectedFaculty.id);
      setIsDeleteOpen(false);
      setSelectedFaculty(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Faculty</h1>
          <p className="text-sm text-slate-600">Manage instructor records and status.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Faculty
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          placeholder="Search by employee no, name, email, or department"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={handleSearch} disabled={isLoading}>
          Search
        </Button>
        <Button type="button" variant="secondary" onClick={refresh} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FacultyTable
        faculty={faculty}
        isLoading={isLoading}
        onEdit={(member) => {
          setSelectedFaculty(member);
          setIsEditOpen(true);
        }}
        onDelete={(member) => {
          setSelectedFaculty(member);
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

      <FacultyFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Faculty"
        isSubmitting={isSaving}
        onSubmit={handleCreate}
      />

      <FacultyFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedFaculty(null);
          }
        }}
        title="Edit Faculty"
        initialValues={editValues}
        isSubmitting={isSaving}
        onSubmit={handleEdit}
      />

      <DeleteFacultyDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedFaculty(null);
          }
        }}
        faculty={selectedFaculty}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
