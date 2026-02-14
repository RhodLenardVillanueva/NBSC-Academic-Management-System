// frontend/src/features/academic-years/components/academic-years-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { AcademicYear } from "../types/academic-year-types";

type AcademicYearsTableProps = {
  academicYears: AcademicYear[];
  isLoading: boolean;
  onEdit: (academicYear: AcademicYear) => void;
  onDelete: (academicYear: AcademicYear) => void;
};

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

export function AcademicYearsTable({
  academicYears,
  isLoading,
  onEdit,
  onDelete,
}: AcademicYearsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year Start</TableHead>
            <TableHead>Year End</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                Loading academic years...
              </TableCell>
            </TableRow>
          ) : academicYears.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-slate-500">
                No academic years found.
              </TableCell>
            </TableRow>
          ) : (
            academicYears.map((academicYear) => {
              const { yearStart, yearEnd } = parseAcademicYear(academicYear.name);
              return (
                <TableRow key={academicYear.id}>
                  <TableCell className="font-medium text-slate-900">
                    {yearStart}
                  </TableCell>
                  <TableCell>{yearEnd || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        academicYear.is_active ? "text-emerald-600" : "text-slate-500"
                      }
                    >
                      {academicYear.is_active ? "Current" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="info"
                        className="px-3 py-1.5"
                        onClick={() => onEdit(academicYear)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => onDelete(academicYear)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
