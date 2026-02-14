// frontend/src/features/dashboard-stats/components/stats-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";

type StatsCardProps = {
  label: string;
  value: number;
  description?: string;
};

export function StatsCard({ label, value, description }: StatsCardProps): JSX.Element {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-semibold text-[#8B1E1E]">{value}</div>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
