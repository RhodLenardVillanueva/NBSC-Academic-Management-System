// frontend/src/features/students/components/students-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { Student } from "../types/student-types";

type StudentsTableProps = {
  students: Student[];
  isLoading: boolean;
  isRestoring?: boolean;
  isArchivedView: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRestore: (student: Student) => void;
};

export function StudentsTable({
  students,
  isLoading,
  isRestoring = false,
  isArchivedView,
  onEdit,
  onDelete,
  onRestore,
}: StudentsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Program ID</TableHead>
            <TableHead>Year Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                Loading students...
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-slate-900">
                  {student.student_number}
                </TableCell>
                <TableCell>
                  {student.last_name}, {student.first_name}
                </TableCell>
                <TableCell>{student.program_id ?? "—"}</TableCell>
                <TableCell>{student.year_level}</TableCell>
                <TableCell className="capitalize">{student.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isArchivedView ? (
                      <Button
                        type="button"
                        variant="info"
                        className="px-3 py-1.5"
                        onClick={() => onRestore(student)}
                        disabled={isRestoring}
                      >
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="info"
                          className="px-3 py-1.5"
                          onClick={() => onEdit(student)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5"
                          onClick={() => onDelete(student)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
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
