// frontend/src/features/semesters/hooks/use-semesters.ts
import { useCallback, useEffect, useState } from "react";
import { semesterService } from "../semester-service";
import type { PaginatedResponse, Semester } from "../types/semester-types";

type UseSemestersState = {
  semesters: Semester[];
  pagination: PaginatedResponse<Semester>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<Semester> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useSemesters(page: number): UseSemestersState {
  const [pagination, setPagination] = useState<PaginatedResponse<Semester>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSemesters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await semesterService.list({ page });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load semesters.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadSemesters();
  }, [loadSemesters]);

  return {
    semesters: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadSemesters,
  };
}
