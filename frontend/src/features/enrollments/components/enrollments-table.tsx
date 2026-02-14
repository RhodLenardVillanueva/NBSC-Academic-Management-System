// frontend/src/features/enrollments/components/enrollments-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { Enrollment } from "../types/enrollment-types";

type EnrollmentsTableProps = {
  enrollments: Enrollment[];
  isLoading: boolean;
  studentLookup: Map<number, string>;
  programLookup: Map<number, string>;
  academicYearLookup: Map<number, string>;
  semesterLookup: Map<number, string>;
  onView?: (enrollment: Enrollment) => void;
  onAssessment?: (enrollment: Enrollment) => void;
  onEdit?: (enrollment: Enrollment) => void;
  onDelete?: (enrollment: Enrollment) => void;
};

const statusStyles: Record<Enrollment["status"], string> = {
  enrolled: "text-emerald-600",
  cancelled: "text-amber-600",
  completed: "text-slate-600",
};

export function EnrollmentsTable({
  enrollments,
  isLoading,
  studentLookup,
  programLookup,
  academicYearLookup,
  semesterLookup,
  onView,
  onAssessment,
  onEdit,
  onDelete,
}: EnrollmentsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead className="text-center">Year Level</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                Loading enrollments...
              </TableCell>
            </TableRow>
          ) : enrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                No enrollments found.
              </TableCell>
            </TableRow>
          ) : (
            enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell className="font-medium text-slate-900">
                  {studentLookup.get(enrollment.student_id) ?? "Unknown"}
                </TableCell>
                <TableCell>
                  {programLookup.get(enrollment.program_id) ?? "Unknown"}
                </TableCell>
                <TableCell>
                  {academicYearLookup.get(enrollment.academic_year_id) ?? "Unknown"}
                </TableCell>
                <TableCell>
                  {semesterLookup.get(enrollment.semester_id) ?? "Unknown"}
                </TableCell>
                <TableCell className="text-center">{enrollment.year_level}</TableCell>
                <TableCell className="text-center">{enrollment.total_units}</TableCell>
                <TableCell>
                  <span className={statusStyles[enrollment.status]}>
                    {enrollment.status === "enrolled"
                      ? "Enrolled"
                      : enrollment.status === "cancelled"
                        ? "Cancelled"
                        : "Completed"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {onView ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-1.5"
                        onClick={() => onView(enrollment)}
                      >
                        View
                      </Button>
                    ) : null}
                    {onAssessment ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-1.5"
                        onClick={() => onAssessment(enrollment)}
                      >
                        Assessment
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button
                        type="button"
                        variant="info"
                        className="px-3 py-1.5"
                        onClick={() => onEdit(enrollment)}
                      >
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => onDelete(enrollment)}
                      >
                        Delete
                      </Button>
                    ) : null}
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
