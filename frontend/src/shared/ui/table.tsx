// frontend/src/shared/ui/table.tsx
import * as React from "react";

type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: TableProps): JSX.Element {
  const classes = ["w-full text-sm", className].filter(Boolean).join(" ");
  return <table className={classes} {...props} />;
}

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;
type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;
type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function TableHeader({ className, ...props }: TableSectionProps): JSX.Element {
  const classes = ["bg-slate-50 text-left", className].filter(Boolean).join(" ");
  return <thead className={classes} {...props} />;
}

export function TableBody({ className, ...props }: TableSectionProps): JSX.Element {
  const classes = ["divide-y divide-slate-200", className].filter(Boolean).join(" ");
  return <tbody className={classes} {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps): JSX.Element {
  const classes = ["hover:bg-slate-50", className].filter(Boolean).join(" ");
  return <tr className={classes} {...props} />;
}

export function TableHead({ className, ...props }: TableHeadProps): JSX.Element {
  const classes = ["px-4 py-3 text-xs font-semibold uppercase text-slate-500", className]
    .filter(Boolean)
    .join(" ");
  return <th className={classes} {...props} />;
}

export function TableCell({ className, ...props }: TableCellProps): JSX.Element {
  const classes = ["px-4 py-3 text-slate-700", className].filter(Boolean).join(" ");
  return <td className={classes} {...props} />;
}
