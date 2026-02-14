// frontend/src/features/assessment/components/assessment-create-dialog.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";
import type { AssessmentCreatePayload } from "../assessment-types";

type AdjustmentForm = {
  description: string;
  amount: string;
};

type AssessmentCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: AssessmentCreatePayload) => Promise<void>;
};

type ValidationErrors = {
  tuition_amount?: string;
  miscellaneous_amount?: string;
  other_fees_amount?: string;
  discount_amount?: string;
  adjustments?: string;
};

const defaultAdjustments: AdjustmentForm[] = [];

const defaultValues = {
  tuition_amount: "",
  miscellaneous_amount: "",
  other_fees_amount: "",
  discount_amount: "",
  adjustments: defaultAdjustments,
};

const parseNumber = (value: string): number => Number(value);

export function AssessmentCreateDialog({
  open,
  onOpenChange,
  isSubmitting,
  errorMessage,
  onSubmit,
}: AssessmentCreateDialogProps): JSX.Element {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setValues(defaultValues);
      setErrors({});
    }
  }, [open]);

  const adjustments = useMemo(() => values.adjustments ?? [], [values.adjustments]);

  const handleChange = (field: keyof typeof defaultValues) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAdjustmentChange = (
    index: number,
    field: keyof AdjustmentForm,
    value: string,
  ) => {
    setValues((prev) => {
      const next = [...prev.adjustments];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, adjustments: next };
    });
  };

  const addAdjustment = () => {
    setValues((prev) => ({
      ...prev,
      adjustments: [...prev.adjustments, { description: "", amount: "" }],
    }));
  };

  const removeAdjustment = (index: number) => {
    setValues((prev) => ({
      ...prev,
      adjustments: prev.adjustments.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validate = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};

    const tuition = parseNumber(values.tuition_amount);
    if (!values.tuition_amount.trim() || Number.isNaN(tuition) || tuition < 0) {
      nextErrors.tuition_amount = "Tuition amount must be 0 or more.";
    }

    const misc = parseNumber(values.miscellaneous_amount);
    if (!values.miscellaneous_amount.trim() || Number.isNaN(misc) || misc < 0) {
      nextErrors.miscellaneous_amount = "Miscellaneous amount must be 0 or more.";
    }

    const other = parseNumber(values.other_fees_amount);
    if (!values.other_fees_amount.trim() || Number.isNaN(other) || other < 0) {
      nextErrors.other_fees_amount = "Other fees amount must be 0 or more.";
    }

    const discount = parseNumber(values.discount_amount);
    if (!values.discount_amount.trim() || Number.isNaN(discount) || discount < 0) {
      nextErrors.discount_amount = "Discount amount must be 0 or more.";
    }

    const invalidAdjustment = adjustments.some(
      (adjustment) =>
        !adjustment.description.trim() ||
        adjustment.amount.trim() === "" ||
        Number.isNaN(parseNumber(adjustment.amount)),
    );
    if (invalidAdjustment) {
      nextErrors.adjustments = "Adjustments need description and amount.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const payload: AssessmentCreatePayload = {
      tuition_amount: parseNumber(values.tuition_amount),
      miscellaneous_amount: parseNumber(values.miscellaneous_amount),
      other_fees_amount: parseNumber(values.other_fees_amount),
      discount_amount: parseNumber(values.discount_amount),
    };

    const adjustmentPayload = adjustments
      .filter((adjustment) => adjustment.description.trim() || adjustment.amount.trim())
      .map((adjustment) => ({
        description: adjustment.description.trim(),
        amount: parseNumber(adjustment.amount),
      }));

    if (adjustmentPayload.length > 0) {
      payload.adjustments = adjustmentPayload;
    }

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Create Assessment</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tuition_amount">Tuition Amount</Label>
              <Input
                id="tuition_amount"
                type="number"
                min={0}
                step="0.01"
                value={values.tuition_amount}
                onChange={handleChange("tuition_amount")}
                required
              />
              {errors.tuition_amount ? (
                <span className="text-xs text-red-600">{errors.tuition_amount}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="miscellaneous_amount">Miscellaneous Amount</Label>
              <Input
                id="miscellaneous_amount"
                type="number"
                min={0}
                step="0.01"
                value={values.miscellaneous_amount}
                onChange={handleChange("miscellaneous_amount")}
                required
              />
              {errors.miscellaneous_amount ? (
                <span className="text-xs text-red-600">{errors.miscellaneous_amount}</span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="other_fees_amount">Other Fees Amount</Label>
              <Input
                id="other_fees_amount"
                type="number"
                min={0}
                step="0.01"
                value={values.other_fees_amount}
                onChange={handleChange("other_fees_amount")}
                required
              />
              {errors.other_fees_amount ? (
                <span className="text-xs text-red-600">{errors.other_fees_amount}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="discount_amount">Discounts / Scholarships</Label>
              <Input
                id="discount_amount"
                type="number"
                min={0}
                step="0.01"
                value={values.discount_amount}
                onChange={handleChange("discount_amount")}
                required
              />
              {errors.discount_amount ? (
                <span className="text-xs text-red-600">{errors.discount_amount}</span>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Adjustments</p>
              <Button type="button" variant="secondary" onClick={addAdjustment}>
                Add Adjustment
              </Button>
            </div>
            {adjustments.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">No adjustments added.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {adjustments.map((adjustment, index) => (
                  <div key={`adjustment-${index}`} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <Input
                      aria-label={`Adjustment description ${index + 1}`}
                      placeholder="Description"
                      value={adjustment.description}
                      onChange={(event) =>
                        handleAdjustmentChange(index, "description", event.target.value)
                      }
                    />
                    <Input
                      aria-label={`Adjustment amount ${index + 1}`}
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={adjustment.amount}
                      onChange={(event) =>
                        handleAdjustmentChange(index, "amount", event.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeAdjustment(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.adjustments ? (
              <p className="mt-2 text-xs text-red-600">{errors.adjustments}</p>
            ) : null}
          </div>

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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
