// frontend/src/features/academic-years/components/academic-year-form-dialog.tsx
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
import type { AcademicYearFormValues, AcademicYearPayload } from "../types/academic-year-types";

type AcademicYearFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: AcademicYearFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: AcademicYearPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof AcademicYearFormValues, string>>;

const defaultValues: AcademicYearFormValues = {
  year_start: "",
  year_end: "",
  is_current: "false",
};

const isValidYear = (value: string): boolean => {
  const year = Number(value);
  return Number.isInteger(year) && value.trim().length === 4;
};

const validateValues = (values: AcademicYearFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!values.year_start.trim()) {
    errors.year_start = "Year start is required.";
  } else if (!isValidYear(values.year_start)) {
    errors.year_start = "Year start must be a 4-digit year.";
  }

  if (!values.year_end.trim()) {
    errors.year_end = "Year end is required.";
  } else if (!isValidYear(values.year_end)) {
    errors.year_end = "Year end must be a 4-digit year.";
  }

  const yearStart = Number(values.year_start);
  const yearEnd = Number(values.year_end);
  if (Number.isInteger(yearStart) && Number.isInteger(yearEnd) && yearEnd < yearStart) {
    errors.year_end = "Year end must be greater than or equal to year start.";
  }

  if (values.is_current !== "true" && values.is_current !== "false") {
    errors.is_current = "Status is required.";
  }

  return errors;
};

export function AcademicYearFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  onSubmit,
}: AcademicYearFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<AcademicYearFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof AcademicYearFormValues) => (
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

    const payload: AcademicYearPayload = {
      name: `${values.year_start.trim()}-${values.year_end.trim()}`,
      is_active: values.is_current === "true",
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
              <Label htmlFor="year_start">Year Start</Label>
              <Input
                id="year_start"
                type="number"
                min={1900}
                max={2100}
                value={values.year_start}
                onChange={handleChange("year_start")}
                required
              />
              {errors.year_start ? (
                <span className="text-xs text-red-600">{errors.year_start}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="year_end">Year End</Label>
              <Input
                id="year_end"
                type="number"
                min={1900}
                max={2100}
                value={values.year_end}
                onChange={handleChange("year_end")}
                required
              />
              {errors.year_end ? (
                <span className="text-xs text-red-600">{errors.year_end}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="is_current">Status</Label>
            <Select id="is_current" value={values.is_current} onChange={handleChange("is_current")}>
              <option value="false">Inactive</option>
              <option value="true">Current</option>
            </Select>
            {errors.is_current ? (
              <span className="text-xs text-red-600">{errors.is_current}</span>
            ) : null}
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
