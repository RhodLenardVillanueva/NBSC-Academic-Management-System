// frontend/src/features/programs/delete-program-dialog.tsx
import { Button } from "../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import type { Program } from "./program-types";

type DeleteProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: Program | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteProgramDialog({
  open,
  onOpenChange,
  program,
  isDeleting,
  onConfirm,
}: DeleteProgramDialogProps): JSX.Element {
  const programName = program ? program.name : "this program";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Program</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {programName}? This action cannot be undone.
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
