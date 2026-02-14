// frontend/src/shared/ui/dialog.tsx
import * as React from "react";

type DialogContextValue = {
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogContent({ className, ...props }: DialogContentProps): JSX.Element {
  const classes = [
    "w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps): JSX.Element {
  const classes = ["border-b border-slate-100 px-6 py-4", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle({ className, ...props }: DialogTitleProps): JSX.Element {
  const classes = ["text-base font-semibold text-slate-900", className]
    .filter(Boolean)
    .join(" ");
  return <h2 className={classes} {...props} />;
}

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps): JSX.Element {
  const classes = ["text-sm text-slate-600", className].filter(Boolean).join(" ");
  return <p className={classes} {...props} />;
}

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps): JSX.Element {
  const classes = ["flex items-center justify-end gap-2 px-6 py-4", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

export function DialogCloseButton(): JSX.Element | null {
  const context = React.useContext(DialogContext);
  if (!context) {
    return null;
  }

  return (
    <button
      type="button"
      className="text-sm text-slate-500 hover:text-slate-700"
      onClick={() => context.onOpenChange(false)}
    >
      Close
    </button>
  );
}
