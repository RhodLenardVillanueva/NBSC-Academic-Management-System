// frontend/src/features/semesters/components/semester-form-dialog.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import type { SemesterFormValues, SemesterPayload } from "../types/semester-types";

type AcademicYearOption = {
  value: string;
  label: string;
};

type SemesterFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: SemesterFormValues;
  isSubmitting: boolean;
  academicYearOptions: AcademicYearOption[];
  isAcademicYearsLoading: boolean;
  onSubmit: (payload: SemesterPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof SemesterFormValues, string>>;

const defaultValues: SemesterFormValues = {
  name: "",
  academic_year_id: "",
  is_current: "false",
  add_drop_start: "",
  add_drop_end: "",
};

const validateValues = (values: SemesterFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = "Semester name is required.";
  } else if (values.name.trim().length > 50) {
    errors.name = "Semester name must be 50 characters or less.";
  }

  const academicYearId = Number(values.academic_year_id);
  if (!values.academic_year_id.trim()) {
    errors.academic_year_id = "Academic year is required.";
  } else if (!Number.isInteger(academicYearId) || academicYearId <= 0) {
    errors.academic_year_id = "Academic year must be valid.";
  }

  if (values.is_current !== "true" && values.is_current !== "false") {
    errors.is_current = "Status is required.";
  }

  if (!values.add_drop_start.trim()) {
    errors.add_drop_start = "Add/drop start date is required.";
  }

  if (!values.add_drop_end.trim()) {
    errors.add_drop_end = "Add/drop end date is required.";
  }

  if (values.add_drop_start && values.add_drop_end) {
    const startDate = new Date(`${values.add_drop_start}T00:00:00`);
    const endDate = new Date(`${values.add_drop_end}T00:00:00`);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      errors.add_drop_end = "Add/drop dates must be valid.";
    } else if (endDate < startDate) {
      errors.add_drop_end = "Add/drop end date must be on or after start date.";
    }
  }

  return errors;
};

export function SemesterFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  academicYearOptions,
  isAcademicYearsLoading,
  onSubmit,
}: SemesterFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<SemesterFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof SemesterFormValues) => (
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

    const payload: SemesterPayload = {
      name: values.name.trim(),
      academic_year_id: Number(values.academic_year_id),
      is_current: values.is_current === "true",
      add_drop_start: values.add_drop_start,
      add_drop_end: values.add_drop_end,
    };

    await onSubmit(payload);
  };

  const canSubmit = academicYearOptions.length > 0 && !isAcademicYearsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">{title}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="semester_name">Semester Name</Label>
            <Input
              id="semester_name"
              value={values.name}
              onChange={handleChange("name")}
              required
            />
            {errors.name ? (
              <span className="text-xs text-red-600">{errors.name}</span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="academic_year_id">Academic Year</Label>
            <Select
              id="academic_year_id"
              value={values.academic_year_id}
              onChange={handleChange("academic_year_id")}
              disabled={isAcademicYearsLoading}
            >
              <option value="">
                {isAcademicYearsLoading ? "Loading academic years..." : "Select academic year"}
              </option>
              {academicYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.academic_year_id ? (
              <span className="text-xs text-red-600">{errors.academic_year_id}</span>
            ) : null}
            {academicYearOptions.length === 0 && !isAcademicYearsLoading ? (
              <span className="text-xs text-amber-600">
                Add an academic year first to create semesters.
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="semester_current">Status</Label>
            <Select
              id="semester_current"
              value={values.is_current}
              onChange={handleChange("is_current")}
            >
              <option value="false">Inactive</option>
              <option value="true">Current</option>
            </Select>
            {errors.is_current ? (
              <span className="text-xs text-red-600">{errors.is_current}</span>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="add_drop_start">Add/Drop Start</Label>
              <Input
                id="add_drop_start"
                type="date"
                value={values.add_drop_start}
                onChange={handleChange("add_drop_start")}
                required
              />
              {errors.add_drop_start ? (
                <span className="text-xs text-red-600">{errors.add_drop_start}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="add_drop_end">Add/Drop End</Label>
              <Input
                id="add_drop_end"
                type="date"
                value={values.add_drop_end}
                onChange={handleChange("add_drop_end")}
                required
              />
              {errors.add_drop_end ? (
                <span className="text-xs text-red-600">{errors.add_drop_end}</span>
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
            <Button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
