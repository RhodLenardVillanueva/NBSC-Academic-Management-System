// frontend/src/features/enrollments/hooks/use-enrollments.ts
import { useCallback, useEffect, useState } from "react";
import { enrollmentService } from "../enrollment-service";
import type { Enrollment, PaginatedResponse } from "../types/enrollment-types";

type UseEnrollmentsState = {
  enrollments: Enrollment[];
  pagination: PaginatedResponse<Enrollment>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<Enrollment> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useEnrollments(page: number): UseEnrollmentsState {
  const [pagination, setPagination] = useState<PaginatedResponse<Enrollment>>(
    emptyPagination,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.list({ page });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load enrollments.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadEnrollments();
  }, [loadEnrollments]);

  return {
    enrollments: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadEnrollments,
  };
}
