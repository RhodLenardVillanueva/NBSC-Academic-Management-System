// frontend/src/features/faculty/components/delete-faculty-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { FacultyMember } from "../types/faculty-types";

type DeleteFacultyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: FacultyMember | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteFacultyDialog({
  open,
  onOpenChange,
  faculty,
  isDeleting,
  onConfirm,
}: DeleteFacultyDialogProps): JSX.Element {
  const name = faculty ? `${faculty.first_name} ${faculty.last_name}` : "this faculty member";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Faculty</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {name}? This action cannot be undone.
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
