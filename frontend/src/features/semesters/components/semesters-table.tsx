// frontend/src/features/semesters/components/semesters-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { Semester } from "../types/semester-types";

const formatDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }
  const [datePart] = value.split("T");
  return datePart || "-";
};

type SemestersTableProps = {
  semesters: Semester[];
  isLoading: boolean;
  academicYearLookup: Map<number, string>;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
};

export function SemestersTable({
  semesters,
  isLoading,
  academicYearLookup,
  onEdit,
  onDelete,
}: SemestersTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Add/Drop Start</TableHead>
            <TableHead>Add/Drop End</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                Loading semesters...
              </TableCell>
            </TableRow>
          ) : semesters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                No semesters found.
              </TableCell>
            </TableRow>
          ) : (
            semesters.map((semester) => (
              <TableRow key={semester.id}>
                <TableCell className="font-medium text-slate-900">{semester.name}</TableCell>
                <TableCell>
                  {academicYearLookup.get(semester.academic_year_id) ?? "Unknown"}
                </TableCell>
                <TableCell>{formatDate(semester.add_drop_start)}</TableCell>
                <TableCell>{formatDate(semester.add_drop_end)}</TableCell>
                <TableCell>
                  <span
                    className={
                      semester.is_current ? "text-emerald-600" : "text-slate-500"
                    }
                  >
                    {semester.is_current ? "Current" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="info"
                      className="px-3 py-1.5"
                      onClick={() => onEdit(semester)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => onDelete(semester)}
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
