// frontend/src/features/course-offerings/components/delete-course-offering-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { CourseOffering } from "../types/course-offering-types";

type DeleteCourseOfferingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseOffering: CourseOffering | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteCourseOfferingDialog({
  open,
  onOpenChange,
  courseOffering,
  isDeleting,
  onConfirm,
}: DeleteCourseOfferingDialogProps): JSX.Element {
  const label = courseOffering ? `section ${courseOffering.section}` : "this course offering";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Course Offering</DialogTitle>
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
