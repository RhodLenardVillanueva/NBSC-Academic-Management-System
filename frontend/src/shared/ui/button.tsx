// frontend/src/shared/ui/button.tsx
import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "info" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#8B1E1E] text-white hover:bg-[#741818]",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
  info: "bg-blue-600 text-white hover:bg-blue-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = "primary", ...props }, ref) => {
    const classes = [
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E1E]",
      variantClasses[variant],
      "disabled:cursor-not-allowed disabled:opacity-60",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} type={type} className={classes} {...props} />;
  },
);

Button.displayName = "Button";
