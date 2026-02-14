// frontend/src/features/enrollments/components/enrollment-attach-dialog.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";

type CourseOfferingOption = {
  value: string;
  label: string;
  availableSlots: number;
  isFull: boolean;
};

type EnrollmentAttachDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  options: CourseOfferingOption[];
  errorMessage: string | null;
  windowMessage: string | null;
  isWindowOpen: boolean;
  onSubmit: (courseOfferingId: number) => Promise<void>;
};

type ValidationErrors = {
  course_offering_id?: string;
};

const parseInteger = (value: string): number => Number(value);

export function EnrollmentAttachDialog({
  open,
  onOpenChange,
  isSubmitting,
  options,
  errorMessage,
  windowMessage,
  isWindowOpen,
  onSubmit,
}: EnrollmentAttachDialogProps): JSX.Element {
  const [selectedId, setSelectedId] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedId),
    [options, selectedId],
  );

  useEffect(() => {
    if (open) {
      setSelectedId("");
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors: ValidationErrors = {};

    const courseOfferingId = parseInteger(selectedId);
    if (!selectedId.trim()) {
      nextErrors.course_offering_id = "Course offering is required.";
    } else if (!Number.isInteger(courseOfferingId) || courseOfferingId <= 0) {
      nextErrors.course_offering_id = "Course offering must be valid.";
    } else if (selectedOption?.isFull) {
      nextErrors.course_offering_id = "Course offering is full.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!isWindowOpen) {
      setErrors({
        course_offering_id: "Add/drop window is closed.",
      });
      return;
    }

    await onSubmit(courseOfferingId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Attach Course Offering</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course_offering_id">Course Offering</Label>
            <Select
              id="course_offering_id"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select course offering</option>
              {options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.isFull}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.course_offering_id ? (
              <span className="text-xs text-red-600">{errors.course_offering_id}</span>
            ) : null}
          </div>

          {windowMessage ? (
            <Alert>
              <AlertDescription>{windowMessage}</AlertDescription>
            </Alert>
          ) : null}

          {errorMessage ? (
            <Alert>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="px-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || options.length === 0 || !isWindowOpen}
            >
              {isSubmitting ? "Attaching..." : "Attach"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
