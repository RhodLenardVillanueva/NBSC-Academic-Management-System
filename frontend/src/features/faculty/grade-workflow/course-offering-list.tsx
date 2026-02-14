// frontend/src/features/faculty/grade-workflow/course-offering-list.tsx
// Faculty grade workflow list for assigned course offerings.

import { Button } from "../../../shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import type { CourseOfferingListItem, OfferingStatus } from "./types/grade-types";

type CourseOfferingListProps = {
  offerings: CourseOfferingListItem[];
  statusByOffering: Record<number, OfferingStatus>;
  isLoading: boolean;
  onSelect: (offeringId: number) => void;
};

const statusStyles: Record<OfferingStatus, string> = {
  open: "bg-emerald-100 text-emerald-700",
  submitted: "bg-slate-200 text-slate-700",
  loading: "bg-slate-100 text-slate-600",
};

const statusLabels: Record<OfferingStatus, string> = {
  open: "Open",
  submitted: "Submitted",
  loading: "Checking...",
};

export function CourseOfferingList({
  offerings,
  statusByOffering,
  isLoading,
  onSelect,
}: CourseOfferingListProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-slate-50">
            <TableHead>Course Code</TableHead>
            <TableHead>Subject Title</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell colSpan={7}>
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                </TableCell>
              </TableRow>
            ))
          ) : offerings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                No course offerings assigned.
              </TableCell>
            </TableRow>
          ) : (
            offerings.map((offering) => {
              const status = statusByOffering[offering.id] ?? "open";
              return (
                <TableRow key={offering.id}>
                  <TableCell className="font-medium text-slate-900">
                    {offering.subject?.code ?? "-"}
                  </TableCell>
                  <TableCell>{offering.subject?.title ?? "-"}</TableCell>
                  <TableCell>{offering.section}</TableCell>
                  <TableCell>{offering.academic_year?.name ?? "-"}</TableCell>
                  <TableCell>{offering.semester?.name ?? "-"}</TableCell>
                  <TableCell>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusStyles[status],
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {statusLabels[status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-1.5"
                      onClick={() => onSelect(offering.id)}
                    >
                      Encode Grades
                    </Button>
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
