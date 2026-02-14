// frontend/src/features/faculty/grade-workflow/grade-summary-panel.tsx
// Faculty grade workflow summary panel for submission status.

import { useState } from "react";
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";

type GradeSummaryPanelProps = {
  totalStudents: number;
  submittedCount: number;
  isAllSubmitted: boolean;
  submittedAt: string | null;
  isReadOnly: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }
  const [datePart, timePart] = value.split("T");
  if (!datePart) {
    return "-";
  }
  const time = timePart ? timePart.split(".")[0] : "";
  return time ? `${datePart} ${time}` : datePart;
};

export function GradeSummaryPanel({
  totalStudents,
  submittedCount,
  isAllSubmitted,
  submittedAt,
  isReadOnly,
  isSubmitting,
  canSubmit,
  onSubmit,
}: GradeSummaryPanelProps): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const statusClass = isAllSubmitted
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";
  const statusLabel = isAllSubmitted ? "Submitted" : "Open";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Grade Status</p>
          <div className="mt-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                statusClass,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {statusLabel}
            </span>
          </div>
        </div>
        {!isReadOnly ? (
          <Button
            type="button"
            variant="primary"
            className="px-4 py-2"
            disabled={!canSubmit || isSubmitting}
            onClick={() => setIsDialogOpen(true)}
          >
            {isSubmitting ? "Submitting..." : "Submit Grades"}
          </Button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Total Students</span>
          <span className="font-medium text-slate-900">{totalStudents}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Submitted</span>
          <span className="font-medium text-slate-900">
            {submittedCount} / {totalStudents}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Last Submitted</span>
          <span className="font-medium text-slate-900">{formatDate(submittedAt)}</span>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit grades?</DialogTitle>
            <DialogDescription>
              This will lock grades for all students in this offering. You will not be able
              to edit after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!canSubmit || isSubmitting}
              onClick={() => {
                setIsDialogOpen(false);
                onSubmit();
              }}
            >
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
