// frontend/src/features/course-offerings/components/course-offerings-table.tsx
import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { CourseOffering } from "../types/course-offering-types";

type CourseOfferingsTableProps = {
  courseOfferings: CourseOffering[];
  isLoading: boolean;
  subjectLookup: Map<number, string>;
  instructorLookup: Map<number, string>;
  semesterLookup: Map<number, string>;
  academicYearLookup: Map<number, string>;
  onEdit: (courseOffering: CourseOffering) => void;
  onDelete: (courseOffering: CourseOffering) => void;
};

const getAvailableSlots = (maxSlots: number, slotsTaken: number): number => {
  const available = maxSlots - slotsTaken;
  return available < 0 ? 0 : available;
};

export function CourseOfferingsTable({
  courseOfferings,
  isLoading,
  subjectLookup,
  instructorLookup,
  semesterLookup,
  academicYearLookup,
  onEdit,
  onDelete,
}: CourseOfferingsTableProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Section</TableHead>
            <TableHead className="text-center">Capacity</TableHead>
            <TableHead className="text-center">Enrolled</TableHead>
            <TableHead className="text-center">Available</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                Loading course offerings...
              </TableCell>
            </TableRow>
          ) : courseOfferings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center text-slate-500">
                No course offerings found.
              </TableCell>
            </TableRow>
          ) : (
            courseOfferings.map((courseOffering) => {
              const availableSlots = getAvailableSlots(
                courseOffering.max_slots,
                courseOffering.slots_taken,
              );
              return (
                <TableRow key={courseOffering.id}>
                  <TableCell className="font-medium text-slate-900">
                    {subjectLookup.get(courseOffering.subject_id) ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    {instructorLookup.get(courseOffering.instructor_id) ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    {academicYearLookup.get(courseOffering.academic_year_id) ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    {semesterLookup.get(courseOffering.semester_id) ?? "Unknown"}
                  </TableCell>
                  <TableCell>{courseOffering.section}</TableCell>
                  <TableCell className="text-center">{courseOffering.max_slots}</TableCell>
                  <TableCell className="text-center">{courseOffering.slots_taken}</TableCell>
                  <TableCell className="text-center">{availableSlots}</TableCell>
                  <TableCell>
                    <span
                      className={
                        courseOffering.is_active ? "text-emerald-600" : "text-slate-500"
                      }
                    >
                      {courseOffering.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="info"
                        className="px-3 py-1.5"
                        onClick={() => onEdit(courseOffering)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => onDelete(courseOffering)}
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
