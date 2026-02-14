// frontend/src/features/assessment/components/payment-modal.tsx
// Payment modal for installment payments.

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import type { Installment, PaymentPayload } from "../types/assessment-types";

const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(numericValue);
};

type PaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: Installment | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onSubmit: (payload: PaymentPayload) => Promise<void>;
};

type ValidationErrors = {
  amount?: string;
  paid_at?: string;
  receipt_number?: string;
};

export function PaymentModal({
  open,
  onOpenChange,
  installment,
  isSubmitting,
  errorMessage,
  onSubmit,
}: PaymentModalProps): JSX.Element {
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (open) {
      setAmount("");
      setPaidAt("");
      setReceiptNumber("");
      setErrors({});
    }
  }, [open]);

  const outstandingValue = useMemo(() => Number(installment?.outstanding ?? 0), [installment]);

  const validate = (): ValidationErrors => {
    const nextErrors: ValidationErrors = {};
    const parsedAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Amount must be greater than 0.";
    } else if (parsedAmount > outstandingValue) {
      nextErrors.amount = "Amount cannot exceed outstanding balance.";
    }

    if (!paidAt.trim()) {
      nextErrors.paid_at = "Payment date is required.";
    }

    if (!receiptNumber.trim()) {
      nextErrors.receipt_number = "Receipt number is required.";
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

    const payload: PaymentPayload = {
      amount: Number(amount),
      paid_at: paidAt,
      receipt_number: receiptNumber.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#8B1E1E]">Record Payment</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handleSubmit}>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-700">Installment</p>
            <p className="text-slate-600">{installment?.description ?? "-"}</p>
            <p className="text-xs text-slate-500">
              Outstanding: {formatCurrency(installment?.outstanding)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="payment_amount">Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
              {errors.amount ? (
                <span className="text-xs text-red-600">{errors.amount}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payment_receipt">Receipt Number</Label>
              <Input
                id="payment_receipt"
                value={receiptNumber}
                onChange={(event) => setReceiptNumber(event.target.value)}
                required
              />
              {errors.receipt_number ? (
                <span className="text-xs text-red-600">{errors.receipt_number}</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="datetime-local"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              required
            />
            {errors.paid_at ? (
              <span className="text-xs text-red-600">{errors.paid_at}</span>
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
            <Button type="submit" disabled={isSubmitting || !installment}>
              {isSubmitting ? "Saving..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
