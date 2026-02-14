// frontend/src/features/programs/program-form.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import type { ProgramFormValues, ProgramPayload } from "./program-types";

type ProgramFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues?: ProgramFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: ProgramPayload) => Promise<void>;
};

type ValidationErrors = Partial<Record<keyof ProgramFormValues, string>>;

const defaultValues: ProgramFormValues = {
  name: "",
  code: "",
  description: "",
};

const validateValues = (values: ProgramFormValues): ValidationErrors => {
  const errors: ValidationErrors = {};
  const trimmedCode = values.code.trim();
  const trimmedName = values.name.trim();

  if (!trimmedCode) {
    errors.code = "Program code is required.";
  } else if (trimmedCode.length > 50) {
    errors.code = "Program code must be 50 characters or less.";
  }

  if (!trimmedName) {
    errors.name = "Program name is required.";
  } else if (trimmedName.length > 150) {
    errors.name = "Program name must be 150 characters or less.";
  }

  return errors;
};

export function ProgramFormDialog({
  open,
  onOpenChange,
  title,
  initialValues,
  isSubmitting,
  onSubmit,
}: ProgramFormDialogProps): JSX.Element {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues],
  );
  const [values, setValues] = useState<ProgramFormValues>(mergedValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(mergedValues);
      setErrors({});
    }
  }, [open, mergedValues]);

  const handleChange = (field: keyof ProgramFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    const payload: ProgramPayload = {
      name: values.name.trim(),
      code: values.code.trim(),
      description: values.description.trim() ? values.description.trim() : null,
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
              <Label htmlFor="program_code">Program Code</Label>
              <Input
                id="program_code"
                value={values.code}
                onChange={handleChange("code")}
                required
              />
              {errors.code ? (
                <span className="text-xs text-red-600">{errors.code}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="program_name">Program Name</Label>
              <Input
                id="program_name"
                value={values.name}
                onChange={handleChange("name")}
                required
              />
              {errors.name ? (
                <span className="text-xs text-red-600">{errors.name}</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="program_description">Description (optional)</Label>
            <textarea
              id="program_description"
              className="min-h-[96px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              value={values.description}
              onChange={handleChange("description")}
              placeholder="Short description"
            />
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
