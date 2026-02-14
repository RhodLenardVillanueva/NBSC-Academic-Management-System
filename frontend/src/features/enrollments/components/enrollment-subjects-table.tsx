// frontend/src/features/enrollments/components/enrollment-subjects-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { EnrollmentCorSubject } from "../types/enrollment-types";

type EnrollmentSubjectsTableProps = {
  subjects: EnrollmentCorSubject[];
  isLoading: boolean;
  isDetaching?: boolean;
  onDetach?: (enrollmentSubjectId: number) => void;
  disableDetach?: boolean;
};

export function EnrollmentSubjectsTable({
  subjects,
  isLoading,
  isDetaching = false,
  onDetach,
  disableDetach = false,
}: EnrollmentSubjectsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Room</TableHead>
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
                No subjects attached.
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject, index) => (
              <TableRow key={`${subject.subject_code ?? "subject"}-${index}`}>
                <TableCell className="font-medium text-slate-900">
                  {subject.subject_code ?? "-"}
                </TableCell>
                <TableCell>{subject.subject_title ?? "-"}</TableCell>
                <TableCell className="text-center">{subject.units ?? 0}</TableCell>
                <TableCell>{subject.section ?? "-"}</TableCell>
                <TableCell>{subject.schedule ?? "-"}</TableCell>
                <TableCell>{subject.room ?? "-"}</TableCell>
                <TableCell className="text-right">
                  {onDetach ? (
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5"
                      onClick={() => {
                        if (subject.enrollment_subject_id) {
                          onDetach(subject.enrollment_subject_id);
                        }
                      }}
                      disabled={
                        isDetaching || disableDetach || !subject.enrollment_subject_id
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
