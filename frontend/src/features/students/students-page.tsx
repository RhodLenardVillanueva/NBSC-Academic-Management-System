// frontend/src/features/students/students-page.tsx
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { studentService } from "./student-service";
import { DeleteStudentDialog } from "./components/delete-student-dialog";
import { Pagination } from "./components/pagination";
import { StudentFormDialog } from "./components/student-form-dialog";
import { StudentsTable } from "./components/students-table";
import { useStudents } from "./hooks/use-students";
import type { Student, StudentFormValues, StudentPayload } from "./types/student-types";

export function StudentsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { students, pagination, isLoading, error, refresh } = useStudents(
    page,
    searchTerm,
    showArchived,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const editValues: StudentFormValues | undefined = useMemo(() => {
    if (!selectedStudent) {
      return undefined;
    }
    return {
      student_number: selectedStudent.student_number,
      first_name: selectedStudent.first_name,
      last_name: selectedStudent.last_name,
      program_id: selectedStudent.program_id?.toString() ?? "",
      year_level: selectedStudent.year_level.toString(),
      status: selectedStudent.status,
    };
  }, [selectedStudent]);

  const handleSearch = (): void => {
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleCreate = async (payload: StudentPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await studentService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: StudentPayload): Promise<void> => {
    if (!selectedStudent) {
      return;
    }
    setIsSaving(true);
    try {
      await studentService.update(selectedStudent.id, payload);
      setIsEditOpen(false);
      setSelectedStudent(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedStudent) {
      return;
    }
    setIsDeleting(true);
    try {
      await studentService.remove(selectedStudent.id);
      setIsDeleteOpen(false);
      setSelectedStudent(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (student: Student): Promise<void> => {
    setIsRestoring(true);
    try {
      await studentService.restore(student.id);
      if (showArchived) {
        setPage(1);
        setShowArchived(false);
        return;
      }
      await refresh();
    } finally {
      setIsRestoring(false);
    }
  };

  const toggleArchived = (): void => {
    setPage(1);
    setShowArchived((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">Students</h1>
            {showArchived ? (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Archived view
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-600">
            {showArchived
              ? "Viewing archived students. Restore to move them back to active."
              : "Manage student records and status."}
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Student
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          placeholder="Search by student number or name"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleSearch}
          disabled={isLoading}
        >
          Search
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={refresh}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={toggleArchived}
          disabled={isLoading || isRestoring}
        >
          {showArchived ? "Show Active" : "Show Archived"}
        </Button>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <StudentsTable
        students={students}
        isLoading={isLoading}
        isRestoring={isRestoring}
        isArchivedView={showArchived}
        onEdit={(student) => {
          setSelectedStudent(student);
          setIsEditOpen(true);
        }}
        onDelete={(student) => {
          setSelectedStudent(student);
          setIsDeleteOpen(true);
        }}
        onRestore={handleRestore}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />

      <StudentFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Student"
        isSubmitting={isSaving}
        onSubmit={handleCreate}
      />

      <StudentFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedStudent(null);
          }
        }}
        title="Edit Student"
        initialValues={editValues}
        isSubmitting={isSaving}
        onSubmit={handleEdit}
      />

      <DeleteStudentDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedStudent(null);
          }
        }}
        student={selectedStudent}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
