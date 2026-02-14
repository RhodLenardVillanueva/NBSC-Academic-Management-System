// frontend/src/shared/ui/card.tsx
import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const classes = [
      "rounded-lg border border-slate-200 bg-white",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} className={classes} {...props} />;
  },
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const classes = ["border-b border-slate-100 px-6 py-4", className]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} className={classes} {...props} />;
  },
);

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const classes = ["text-lg font-semibold text-slate-900", className]
    .filter(Boolean)
    .join(" ");

  return <h2 ref={ref} className={classes} {...props} />;
});

CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const classes = ["px-6 py-6", className].filter(Boolean).join(" ");

    return <div ref={ref} className={classes} {...props} />;
  },
);

CardContent.displayName = "CardContent";
