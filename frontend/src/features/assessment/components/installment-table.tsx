// frontend/src/features/assessment/components/installment-table.tsx
// Installment schedule table with creation and payment actions.

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../shared/ui/dialog";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";
import { Select } from "../../../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/ui/table";
import { useInstallments } from "../hooks/use-installments";
import type {
  Installment,
  InstallmentPlanPayload,
  InstallmentPlanType,
  PaymentPayload,
} from "../types/assessment-types";
import { PaymentModal } from "./payment-modal";

type InstallmentTableProps = {
  assessmentId: number;
  totalAmount: string;
  installments: Installment[];
  canManageInstallments: boolean;
  canProcessPayments: boolean;
  onRefresh: () => Promise<void>;
};

type CustomInstallmentForm = {
  due_date: string;
  description: string;
  amount: string;
};

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

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "-";
  }
  return value.split("T")[0] || "-";
};

const toCents = (value: string | number): number => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return 0;
  }
  return Math.round(numericValue * 100);
};

export function InstallmentTable({
  assessmentId,
  totalAmount,
  installments,
  canManageInstallments,
  canProcessPayments,
  onRefresh,
}: InstallmentTableProps): JSX.Element {
  const { createInstallments, payInstallment, isCreating, isPaying } = useInstallments();
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [planType, setPlanType] = useState<InstallmentPlanType>("custom");
  const [planError, setPlanError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  const [fullDueDate, setFullDueDate] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [defaultStartDate, setDefaultStartDate] = useState("");
  const [defaultIntervalDays, setDefaultIntervalDays] = useState("30");
  const [customInstallments, setCustomInstallments] = useState<CustomInstallmentForm[]>([
    { due_date: "", description: "", amount: "" },
  ]);

  useEffect(() => {
    if (isPlanOpen) {
      setPlanType("custom");
      setPlanError(null);
      setFullDueDate("");
      setFullDescription("");
      setDefaultStartDate("");
      setDefaultIntervalDays("30");
      setCustomInstallments([{ due_date: "", description: "", amount: "" }]);
    }
  }, [isPlanOpen]);

  const totalCents = useMemo(() => toCents(totalAmount), [totalAmount]);

  const addCustomInstallment = () => {
    setCustomInstallments((prev) => [...prev, { due_date: "", description: "", amount: "" }]);
  };

  const removeCustomInstallment = (index: number) => {
    setCustomInstallments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateCustomInstallment = (
    index: number,
    field: keyof CustomInstallmentForm,
    value: string,
  ) => {
    setCustomInstallments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validatePlan = (): string | null => {
    if (planType === "full") {
      if (!fullDueDate.trim()) {
        return "Full payment due date is required.";
      }
      return null;
    }

    if (planType === "default") {
      if (!defaultStartDate.trim()) {
        return "Start date is required for auto plan.";
      }
      return null;
    }

    if (customInstallments.length === 0) {
      return "At least one installment is required.";
    }

    const invalidRow = customInstallments.some(
      (item) =>
        !item.due_date.trim() ||
        !item.description.trim() ||
        !item.amount.trim() ||
        Number.isNaN(Number(item.amount)) ||
        Number(item.amount) <= 0,
    );
    if (invalidRow) {
      return "All installment rows require due date, description, and amount.";
    }

    const sumCents = customInstallments.reduce(
      (total, item) => total + toCents(item.amount),
      0,
    );
    if (sumCents !== totalCents) {
      return "Installment total must match assessment total.";
    }

    return null;
  };

  const handlePlanSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const errorMessage = validatePlan();
    setPlanError(errorMessage);
    if (errorMessage) {
      return;
    }

    let payload: InstallmentPlanPayload = { plan_type: planType };

    if (planType === "full") {
      payload = {
        plan_type: "full",
        due_date: fullDueDate,
        description: fullDescription.trim() || undefined,
      };
    }

    if (planType === "default") {
      const intervalValue = Number(defaultIntervalDays);
      payload = {
        plan_type: "default",
        start_date: defaultStartDate,
        interval_days: Number.isNaN(intervalValue) ? undefined : intervalValue,
      };
    }

    if (planType === "custom") {
      payload = {
        plan_type: "custom",
        installments: customInstallments.map((item) => ({
          due_date: item.due_date,
          description: item.description.trim(),
          amount: Number(item.amount),
        })),
      };
    }

    try {
      await createInstallments(assessmentId, payload);
      setIsPlanOpen(false);
      await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create installments.";
      setPlanError(message);
    }
  };

  const handlePaymentSubmit = async (payload: PaymentPayload): Promise<void> => {
    if (!selectedInstallment) {
      return;
    }
    setPaymentError(null);
    try {
      await payInstallment(selectedInstallment.id, payload);
      setSelectedInstallment(null);
      await onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record payment.";
      setPaymentError(message);
    }
  };

  const paymentStatusLabel = (installment: Installment): string => {
    if (installment.is_paid) {
      return "Paid";
    }
    const paidCents = toCents(installment.paid_amount);
    return paidCents > 0 ? "Partial" : "Unpaid";
  };

  const statusClasses: Record<string, string> = {
    Paid: "text-emerald-700",
    Partial: "text-amber-600",
    Unpaid: "text-slate-500",
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Installment Schedule
        </h3>
        {canManageInstallments ? (
          <Button
            type="button"
            variant="secondary"
            className="print:hidden"
            onClick={() => setIsPlanOpen(true)}
            disabled={installments.length > 0}
          >
            {installments.length > 0 ? "Installments Created" : "Create Installments"}
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Due Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32 text-right">Amount</TableHead>
              <TableHead className="w-32 text-right">Paid</TableHead>
              <TableHead className="w-36 text-right">Outstanding</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-24 text-right print:hidden">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-slate-500">
                  No installment schedule created.
                </TableCell>
              </TableRow>
            ) : (
              installments.map((installment) => {
                const status = paymentStatusLabel(installment);
                const canPay =
                  canProcessPayments && toCents(installment.outstanding) > 0 && !installment.is_paid;

                return (
                  <TableRow key={installment.id}>
                    <TableCell>{formatDate(installment.due_date)}</TableCell>
                    <TableCell>{installment.description}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(installment.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(installment.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(installment.outstanding)}
                    </TableCell>
                    <TableCell>
                      <span className={statusClasses[status] ?? "text-slate-600"}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      {canPay ? (
                        <Button
                          type="button"
                          variant="info"
                          className="px-3 py-1.5"
                          onClick={() => setSelectedInstallment(installment)}
                          disabled={isPaying(installment.id)}
                        >
                          {isPaying(installment.id) ? "Processing..." : "Pay"}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#8B1E1E]">Create Installment Plan</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4 px-6 py-5" onSubmit={handlePlanSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="plan_type">Plan Type</Label>
              <Select
                id="plan_type"
                value={planType}
                onChange={(event) => setPlanType(event.target.value as InstallmentPlanType)}
              >
                <option value="custom">Custom Installments</option>
                <option value="default">Auto-distribute (5 installments)</option>
                <option value="full">Full Payment</option>
              </Select>
            </div>

            {planType === "full" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full_due_date">Due Date</Label>
                  <Input
                    id="full_due_date"
                    type="date"
                    value={fullDueDate}
                    onChange={(event) => setFullDueDate(event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full_description">Description</Label>
                  <Input
                    id="full_description"
                    value={fullDescription}
                    onChange={(event) => setFullDescription(event.target.value)}
                    placeholder="Full payment"
                  />
                </div>
              </div>
            ) : null}

            {planType === "default" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={defaultStartDate}
                    onChange={(event) => setDefaultStartDate(event.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interval_days">Interval Days</Label>
                  <Input
                    id="interval_days"
                    type="number"
                    min={1}
                    max={365}
                    value={defaultIntervalDays}
                    onChange={(event) => setDefaultIntervalDays(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {planType === "custom" ? (
              <div className="space-y-3">
                {customInstallments.map((item, index) => (
                  <div
                    key={`installment-${index}`}
                    className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto]"
                  >
                    <Input
                      type="date"
                      value={item.due_date}
                      onChange={(event) =>
                        updateCustomInstallment(index, "due_date", event.target.value)
                      }
                      aria-label={`Installment due date ${index + 1}`}
                    />
                    <Input
                      value={item.description}
                      onChange={(event) =>
                        updateCustomInstallment(index, "description", event.target.value)
                      }
                      placeholder="Description"
                      aria-label={`Installment description ${index + 1}`}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.amount}
                      onChange={(event) =>
                        updateCustomInstallment(index, "amount", event.target.value)
                      }
                      placeholder="Amount"
                      aria-label={`Installment amount ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeCustomInstallment(index)}
                      disabled={customInstallments.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addCustomInstallment}>
                  Add Installment
                </Button>
                <p className="text-xs text-slate-500">
                  Total must equal {formatCurrency(totalAmount)}
                </p>
              </div>
            ) : null}

            {planError ? (
              <Alert>
                <AlertDescription>{planError}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter className="px-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPlanOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Saving..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PaymentModal
        open={Boolean(selectedInstallment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInstallment(null);
            setPaymentError(null);
          }
        }}
        installment={selectedInstallment}
        isSubmitting={selectedInstallment ? isPaying(selectedInstallment.id) : false}
        errorMessage={paymentError}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
