// frontend/src/features/academic-years/hooks/use-academic-years.ts
import { useCallback, useEffect, useState } from "react";
import { academicYearService } from "../academic-year-service";
import type { AcademicYear, PaginatedResponse } from "../types/academic-year-types";

type UseAcademicYearsState = {
  academicYears: AcademicYear[];
  pagination: PaginatedResponse<AcademicYear>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<AcademicYear> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useAcademicYears(page: number): UseAcademicYearsState {
  const [pagination, setPagination] =
    useState<PaginatedResponse<AcademicYear>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAcademicYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await academicYearService.list({ page });
      setPagination(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load academic years.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadAcademicYears();
  }, [loadAcademicYears]);

  return {
    academicYears: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadAcademicYears,
  };
}
