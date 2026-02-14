// frontend/src/features/dashboard-stats/dashboard-stats.tsx
import { Button } from "../../shared/ui/button";
import { Alert, AlertDescription } from "../../shared/ui/alert";
import { StatsCard } from "./components/stats-card";
import { useDashboardStats } from "./hooks/use-dashboard-stats";

export function DashboardStats(): JSX.Element {
  const { data, isLoading, error, refresh } = useDashboardStats();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-600">Key totals across academic modules.</p>
        </div>
        <Button type="button" onClick={refresh} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Students" value={data?.students ?? 0} />
        <StatsCard label="Programs" value={data?.programs ?? 0} />
        <StatsCard label="Subjects" value={data?.subjects ?? 0} />
        <StatsCard label="Academic Years" value={data?.academicYears ?? 0} />
        <StatsCard label="Semesters" value={data?.semesters ?? 0} />
        <StatsCard label="Course Offerings" value={data?.courseOfferings ?? 0} />
        <StatsCard label="Enrollments" value={data?.enrollments ?? 0} />
      </div>
    </section>
  );
}
