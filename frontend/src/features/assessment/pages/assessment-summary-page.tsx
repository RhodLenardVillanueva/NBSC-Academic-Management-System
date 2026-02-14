// frontend/src/features/assessment/pages/assessment-summary-page.tsx
// Assessment summary view for payments and totals.

import { useMemo } from "react";
import { Alert, AlertDescription } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button";
import { AdjustmentList } from "../components/adjustment-list";
import { AssessmentSummaryCard } from "../components/assessment-summary-card";
import { useAssessmentSummary } from "../hooks/use-assessment";

type AssessmentSummaryPageProps = {
  assessmentId: number;
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

export function AssessmentSummaryPage({ assessmentId }: AssessmentSummaryPageProps): JSX.Element {
  const { summary, isLoading, error, refresh } = useAssessmentSummary(assessmentId);

  const paidCount = useMemo(() => {
    if (!summary) {
      return 0;
    }
    return summary.installments.filter((installment) => installment.is_paid).length;
  }, [summary]);

  const remainingCount = useMemo(() => {
    if (!summary) {
      return 0;
    }
    return summary.installments.length - paidCount;
  }, [summary, paidCount]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading assessment summary...
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Assessment summary not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assessment Summary</h1>
          <p className="text-sm text-slate-600">
            Overview of payments and outstanding balance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => void refresh()}>
            Refresh
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Amount</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatCurrency(summary.total)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Paid</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            {formatCurrency(summary.total_paid)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
          <p className="mt-2 text-lg font-semibold text-amber-600">
            {formatCurrency(summary.total_outstanding)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Paid Installments</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{paidCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Remaining Installments</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{remainingCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AssessmentSummaryCard breakdown={summary} />
        </div>
        <div>
          <AdjustmentList adjustments={summary.adjustments} />
        </div>
      </div>
    </div>
  );
}
