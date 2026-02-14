// frontend/src/features/academic-years/components/delete-academic-year-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { AcademicYear } from "../types/academic-year-types";

type DeleteAcademicYearDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYear: AcademicYear | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteAcademicYearDialog({
  open,
  onOpenChange,
  academicYear,
  isDeleting,
  onConfirm,
}: DeleteAcademicYearDialogProps): JSX.Element {
  const name = academicYear?.name ?? "this academic year";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Academic Year</DialogTitle>
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
