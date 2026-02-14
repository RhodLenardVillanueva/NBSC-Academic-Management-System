// frontend/src/features/semesters/components/delete-semester-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { Semester } from "../types/semester-types";

type DeleteSemesterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester: Semester | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteSemesterDialog({
  open,
  onOpenChange,
  semester,
  isDeleting,
  onConfirm,
}: DeleteSemesterDialogProps): JSX.Element {
  const name = semester?.name ?? "this semester";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Semester</DialogTitle>
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
