// frontend/src/features/students/components/delete-student-dialog.tsx
import { Button } from "../../../shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { Student } from "../types/student-types";

type DeleteStudentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
};

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
  isDeleting,
  onConfirm,
}: DeleteStudentDialogProps): JSX.Element {
  const studentName = student ? `${student.first_name} ${student.last_name}` : "this student";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {studentName}? This action cannot be undone.
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
