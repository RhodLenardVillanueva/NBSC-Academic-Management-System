// frontend/src/features/dashboard-stats/hooks/use-dashboard-stats.ts
import { useCallback, useEffect, useState } from "react";
import { dashboardStatsService } from "../dashboard-stats-service";
import type { DashboardStats } from "../types/dashboard-stats-types";

type UseDashboardStatsState = {
  data: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useDashboardStats(): UseDashboardStatsState {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardStatsService.getStats();
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard stats.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return {
    data,
    isLoading,
    error,
    refresh: loadStats,
  };
}
