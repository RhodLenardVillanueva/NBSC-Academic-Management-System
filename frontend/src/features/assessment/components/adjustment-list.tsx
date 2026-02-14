// frontend/src/features/assessment/components/adjustment-list.tsx
// Adjustment list for assessment breakdown.

import type { Adjustment } from "../types/assessment-types";

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

type AdjustmentListProps = {
  adjustments: Adjustment[];
};

export function AdjustmentList({ adjustments }: AdjustmentListProps): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Adjustments
      </p>
      {adjustments.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">No adjustments recorded.</p>
      ) : (
        <div className="mt-3 space-y-1">
          {adjustments.map((adjustment) => (
            <div key={adjustment.id} className="flex items-center justify-between">
              <span className="text-slate-600">{adjustment.description}</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(adjustment.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
