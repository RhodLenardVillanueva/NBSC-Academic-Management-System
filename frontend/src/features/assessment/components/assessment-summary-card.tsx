// frontend/src/features/assessment/components/assessment-summary-card.tsx
// Assessment breakdown summary card.

import type { AssessmentBreakdown } from "../types/assessment-types";

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

type AssessmentSummaryCardProps = {
  breakdown: AssessmentBreakdown;
};

export function AssessmentSummaryCard({ breakdown }: AssessmentSummaryCardProps): JSX.Element {
  const netTotal = breakdown.net_total ?? breakdown.total;
  const grandTotal = breakdown.grand_total ?? breakdown.total;

  return (
    <div className="rounded-lg border border-slate-200 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Fee Breakdown
      </p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Tuition Total</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(breakdown.tuition)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Miscellaneous Total</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(breakdown.miscellaneous)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Other Fees Total</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(breakdown.other_fees)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Discounts / Scholarships</span>
          <span className="font-medium text-emerald-700">
            -{formatCurrency(breakdown.discounts)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-slate-700">Net Assessment</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(netTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-slate-900">Grand Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
