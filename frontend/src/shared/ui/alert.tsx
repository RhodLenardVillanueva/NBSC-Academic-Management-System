// frontend/src/shared/ui/alert.tsx
import * as React from "react";

type AlertProps = React.HTMLAttributes<HTMLDivElement>;
type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, ...props }, ref) => {
    const classes = [
      "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} role="alert" className={classes} {...props} />;
  },
);

Alert.displayName = "Alert";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => {
    const classes = ["text-sm", className].filter(Boolean).join(" ");

    return <p ref={ref} className={classes} {...props} />;
  },
);

AlertDescription.displayName = "AlertDescription";
