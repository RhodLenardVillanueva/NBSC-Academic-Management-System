// frontend/src/features/subjects/subjects-page.tsx
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { DeleteSubjectDialog } from "./components/delete-subject-dialog";
import { Pagination } from "./components/pagination";
import { SubjectFormDialog } from "./components/subject-form-dialog";
import { SubjectsTable } from "./components/subjects-table";
import { subjectService } from "./subject-service";
import { useSubjects } from "./hooks/use-subjects";
import type { Subject, SubjectFormValues, SubjectPayload } from "./types/subject-types";

export function SubjectsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { subjects, pagination, isLoading, error, refresh } = useSubjects(
    page,
    searchTerm,
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const editValues: SubjectFormValues | undefined = useMemo(() => {
    if (!selectedSubject) {
      return undefined;
    }
    return {
      code: selectedSubject.code,
      title: selectedSubject.title,
      units: selectedSubject.units.toString(),
      lecture_hours: selectedSubject.lecture_hours.toString(),
      lab_hours: selectedSubject.lab_hours.toString(),
      is_active: selectedSubject.is_active ? "true" : "false",
    };
  }, [selectedSubject]);

  const handleSearch = (): void => {
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleCreate = async (payload: SubjectPayload): Promise<void> => {
    setIsSaving(true);
    try {
      await subjectService.create(payload);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: SubjectPayload): Promise<void> => {
    if (!selectedSubject) {
      return;
    }
    setIsSaving(true);
    try {
      await subjectService.update(selectedSubject.id, payload);
      setIsEditOpen(false);
      setSelectedSubject(null);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!selectedSubject) {
      return;
    }
    setIsDeleting(true);
    try {
      await subjectService.remove(selectedSubject.id);
      setIsDeleteOpen(false);
      setSelectedSubject(null);
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (subject: Subject): Promise<void> => {
    setIsToggling(true);
    try {
      await subjectService.update(subject.id, {
        code: subject.code,
        title: subject.title,
        units: subject.units,
        lecture_hours: subject.lecture_hours,
        lab_hours: subject.lab_hours,
        is_active: !subject.is_active,
      });
      await refresh();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Subjects</h1>
          <p className="text-sm text-slate-600">Manage subject offerings and status.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Add Subject
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-sm"
          placeholder="Search by code or title"
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
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <SubjectsTable
        subjects={subjects}
        isLoading={isLoading}
        isToggling={isToggling}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          setIsEditOpen(true);
        }}
        onDelete={(subject) => {
          setSelectedSubject(subject);
          setIsDeleteOpen(true);
        }}
        onToggleActive={handleToggleActive}
      />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        onPageChange={(nextPage) => setPage(nextPage)}
        isLoading={isLoading}
      />

      <SubjectFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create Subject"
        isSubmitting={isSaving}
        onSubmit={handleCreate}
      />

      <SubjectFormDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedSubject(null);
          }
        }}
        title="Edit Subject"
        initialValues={editValues}
        isSubmitting={isSaving}
        onSubmit={handleEdit}
      />

      <DeleteSubjectDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedSubject(null);
          }
        }}
        subject={selectedSubject}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
