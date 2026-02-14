// frontend/src/features/students/components/student-form-dialog.tsx
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import { programService } from "../../programs/program-service";
import type { Program } from "../../programs/program-types";
import type { StudentFormValues, StudentPayload, StudentStatus } from "../types/student-types";

type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: StudentFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: StudentPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof StudentFormValues, string>>;
type ProgramOption = {
  value: string;
  label: string;
};

const statusOptions: { value: StudentStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "dropped", label: "Dropped" },
  { value: "graduated", label: "Graduated" },
];

const defaultValues: StudentFormValues = {
  student_number: "",
  first_name: "",
  last_name: "",
  program_id: "",
  year_level: "1",
  status: "active",
};

const validateValues = (values: StudentFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!values.student_number.trim()) {
    errors.student_number = "Student number is required.";
  }
  if (!values.first_name.trim()) {
    errors.first_name = "First name is required.";
  }
  if (!values.last_name.trim()) {
    errors.last_name = "Last name is required.";
  }
  const yearLevel = Number(values.year_level);
  if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 10) {
    errors.year_level = "Year level must be between 1 and 10.";
  }
  if (!values.status) {
    errors.status = "Status is required.";
  }
  if (values.program_id.trim()) {
    const programId = Number(values.program_id);
    if (!Number.isInteger(programId) || programId <= 0) {
      errors.program_id = "Program must be valid.";
    }
  }
  return errors;
};

export function StudentFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  onSubmit,
}: StudentFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<StudentFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);

  const loadPrograms = useCallback(async () => {
    setIsProgramsLoading(true);
    try {
      const result = await programService.list({ page: 1 });
      setPrograms(result.data);
    } catch {
      setPrograms([]);
    } finally {
      setIsProgramsLoading(false);
    }
  }, []);

  const programOptions = useMemo<ProgramOption[]>(() => {
    return programs.map((program) => ({
      value: program.id.toString(),
      label: `${program.code} - ${program.name}`,
    }));
  }, [programs]);

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
      void loadPrograms();
    }
  }, [open, mergedValues, loadPrograms]);

  const handleChange = (field: keyof StudentFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validateValues(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: StudentPayload = {
      student_number: values.student_number.trim(),
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      program_id: values.program_id.trim() ? Number(values.program_id) : null,
      year_level: Number(values.year_level),
      status: values.status,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">{title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student_number">Student Number</Label>
              <Input
                id="student_number"
                value={values.student_number}
                onChange={handleChange("student_number")}
                required
              />
              {errors.student_number ? (
                <span className="text-xs text-red-600">{errors.student_number}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="year_level">Year Level</Label>
              <Input
                id="year_level"
                type="number"
                min={1}
                max={10}
                value={values.year_level}
                onChange={handleChange("year_level")}
                required
              />
              {errors.year_level ? (
                <span className="text-xs text-red-600">{errors.year_level}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={values.first_name}
                onChange={handleChange("first_name")}
                required
              />
              {errors.first_name ? (
                <span className="text-xs text-red-600">{errors.first_name}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={values.last_name}
                onChange={handleChange("last_name")}
                required
              />
              {errors.last_name ? (
                <span className="text-xs text-red-600">{errors.last_name}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="program_id">Program (optional)</Label>
              <Select
                id="program_id"
                value={values.program_id}
                onChange={handleChange("program_id")}
                disabled={isProgramsLoading}
              >
                <option value="">
                  {isProgramsLoading ? "Loading programs..." : "Select program"}
                </option>
                {programOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.program_id ? (
                <span className="text-xs text-red-600">{errors.program_id}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={values.status} onChange={handleChange("status")}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {errors.status ? (
                <span className="text-xs text-red-600">{errors.status}</span>
              ) : null}
            </div>
          </div>
          <DialogFooter className="px-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
