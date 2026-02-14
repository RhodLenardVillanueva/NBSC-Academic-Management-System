// frontend/src/features/_layout/dashboard-layout/components/topbar.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../../shared/ui/button";

type TopbarProps = {
  onToggleSidebar: () => void;
};

export function Topbar({ onToggleSidebar }: TopbarProps): JSX.Element {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateTimeLabel = useMemo(() => {
    const datePart = new Intl.DateTimeFormat("en-PH", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(now);
    const timePart = new Intl.DateTimeFormat("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
    return `${datePart} · ${timePart}`;
  }, [now]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm print:hidden">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-sm md:hidden"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          Menu
        </Button>
        <span className="text-base font-semibold text-[#8B1E1E]">NBSC-SIMS</span>
      </div>
      <div className="text-sm text-slate-600">{dateTimeLabel}</div>
    </header>
  );
}
