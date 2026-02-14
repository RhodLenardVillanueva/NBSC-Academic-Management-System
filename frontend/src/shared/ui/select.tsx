// frontend/src/shared/ui/select.tsx
import * as React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    const classes = [
      "h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E1E]",
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <select ref={ref} className={classes} {...props} />;
  },
);

Select.displayName = "Select";
