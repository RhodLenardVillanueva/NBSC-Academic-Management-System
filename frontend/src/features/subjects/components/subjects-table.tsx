// frontend/src/features/subjects/components/subjects-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { Subject } from "../types/subject-types";

type SubjectsTableProps = {
  subjects: Subject[];
  isLoading: boolean;
  isToggling: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onToggleActive: (subject: Subject) => void;
};

export function SubjectsTable({
  subjects,
  isLoading,
  isToggling,
  onEdit,
  onDelete,
  onToggleActive,
}: SubjectsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead className="text-center">Lecture</TableHead>
            <TableHead className="text-center">Lab</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                Loading subjects...
              </TableCell>
            </TableRow>
          ) : subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                No subjects found.
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium text-slate-900">
                  {subject.code}
                </TableCell>
                <TableCell>{subject.title}</TableCell>
                <TableCell className="text-center">{subject.units}</TableCell>
                <TableCell className="text-center">{subject.lecture_hours}</TableCell>
                <TableCell className="text-center">{subject.lab_hours}</TableCell>
                <TableCell>
                  <span
                    className={subject.is_active ? "text-emerald-600" : "text-slate-500"}
                  >
                    {subject.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-1.5"
                      onClick={() => onToggleActive(subject)}
                      disabled={isToggling}
                    >
                      {subject.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      type="button"
                      variant="info"
                      className="px-3 py-1.5"
                      onClick={() => onEdit(subject)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => onDelete(subject)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
