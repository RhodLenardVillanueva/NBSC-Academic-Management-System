// frontend/src/features/subjects/components/subject-form-dialog.tsx
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
import type { SubjectFormValues, SubjectPayload } from "../types/subject-types";

type SubjectFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: SubjectFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: SubjectPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof SubjectFormValues, string>>;

const defaultValues: SubjectFormValues = {
  code: "",
  title: "",
  units: "1",
  lecture_hours: "0",
  lab_hours: "0",
  is_active: "true",
};

const parseOptionalNumber = (value: string): number => {
  if (!value.trim()) {
    return 0;
  }
  return Number(value);
};

const validateValues = (values: SubjectFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};
  const trimmedCode = values.code.trim();
  const trimmedTitle = values.title.trim();

  if (!trimmedCode) {
    errors.code = "Subject code is required.";
  } else if (trimmedCode.length > 20) {
    errors.code = "Subject code must be 20 characters or less.";
  }

  if (!trimmedTitle) {
    errors.title = "Subject title is required.";
  } else if (trimmedTitle.length > 255) {
    errors.title = "Subject title must be 255 characters or less.";
  }

  const unitsValue = Number(values.units);
  if (!Number.isInteger(unitsValue) || unitsValue < 1 || unitsValue > 10) {
    errors.units = "Units must be between 1 and 10.";
  }

  const lectureValue = parseOptionalNumber(values.lecture_hours);
  if (!Number.isInteger(lectureValue) || lectureValue < 0) {
    errors.lecture_hours = "Lecture hours must be 0 or more.";
  }

  const labValue = parseOptionalNumber(values.lab_hours);
  if (!Number.isInteger(labValue) || labValue < 0) {
    errors.lab_hours = "Lab hours must be 0 or more.";
  }

  if (values.is_active !== "true" && values.is_active !== "false") {
    errors.is_active = "Status is required.";
  }

  return errors;
};

export function SubjectFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  onSubmit,
}: SubjectFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<SubjectFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof SubjectFormValues) => (
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

    const payload: SubjectPayload = {
      code: values.code.trim(),
      title: values.title.trim(),
      units: Number(values.units),
      lecture_hours: parseOptionalNumber(values.lecture_hours),
      lab_hours: parseOptionalNumber(values.lab_hours),
      is_active: values.is_active === "true",
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
              <Label htmlFor="subject_code">Subject Code</Label>
              <Input
                id="subject_code"
                value={values.code}
                onChange={handleChange("code")}
                required
              />
              {errors.code ? (
                <span className="text-xs text-red-600">{errors.code}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject_units">Units</Label>
              <Input
                id="subject_units"
                type="number"
                min={1}
                max={10}
                value={values.units}
                onChange={handleChange("units")}
                required
              />
              {errors.units ? (
                <span className="text-xs text-red-600">{errors.units}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject_title">Title</Label>
            <Input
              id="subject_title"
              value={values.title}
              onChange={handleChange("title")}
              required
            />
            {errors.title ? (
              <span className="text-xs text-red-600">{errors.title}</span>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject_lecture">Lecture Hours</Label>
              <Input
                id="subject_lecture"
                type="number"
                min={0}
                value={values.lecture_hours}
                onChange={handleChange("lecture_hours")}
              />
              {errors.lecture_hours ? (
                <span className="text-xs text-red-600">{errors.lecture_hours}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="subject_lab">Lab Hours</Label>
              <Input
                id="subject_lab"
                type="number"
                min={0}
                value={values.lab_hours}
                onChange={handleChange("lab_hours")}
              />
              {errors.lab_hours ? (
                <span className="text-xs text-red-600">{errors.lab_hours}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject_active">Status</Label>
            <Select
              id="subject_active"
              value={values.is_active}
              onChange={handleChange("is_active")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            {errors.is_active ? (
              <span className="text-xs text-red-600">{errors.is_active}</span>
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
