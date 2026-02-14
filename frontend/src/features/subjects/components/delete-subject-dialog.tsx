// frontend/src/features/subjects/components/delete-subject-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { Subject } from "../types/subject-types";

type DeleteSubjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteSubjectDialog({
  open,
  onOpenChange,
  subject,
  isDeleting,
  onConfirm,
}: DeleteSubjectDialogProps): JSX.Element {
  const subjectTitle = subject ? subject.title : "this subject";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Subject</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {subjectTitle}? This action cannot be undone.
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
