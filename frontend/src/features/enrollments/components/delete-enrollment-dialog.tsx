// frontend/src/features/enrollments/components/delete-enrollment-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { Enrollment } from "../types/enrollment-types";

type DeleteEnrollmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteEnrollmentDialog({
  open,
  onOpenChange,
  enrollment,
  isDeleting,
  onConfirm,
}: DeleteEnrollmentDialogProps): JSX.Element {
  const label = enrollment ? `enrollment #${enrollment.id}` : "this enrollment";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Enrollment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {label}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
