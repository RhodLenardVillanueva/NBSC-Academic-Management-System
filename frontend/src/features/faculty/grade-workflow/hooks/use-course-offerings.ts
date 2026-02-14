// frontend/src/features/faculty/grade-workflow/hooks/use-course-offerings.ts
// Faculty grade workflow hooks for course offering lists.

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../../app/api/api-client";
import type { ApiResponse } from "../../../../shared/types/api";
import type {
  CourseOfferingListItem,
  PaginatedResponse,
} from "../types/grade-types";

type UseCourseOfferingsState = {
  courseOfferings: CourseOfferingListItem[];
  pagination: PaginatedResponse<CourseOfferingListItem>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<CourseOfferingListItem> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export function useCourseOfferings(page: number): UseCourseOfferingsState {
  const [pagination, setPagination] = useState<PaginatedResponse<CourseOfferingListItem>>(
    emptyPagination,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseOfferings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<CourseOfferingListItem>>>(
        "/faculty/course-offerings",
        { params: { page } },
      );
      const data = ensureSuccess(response.data);
      setPagination(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load course offerings.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadCourseOfferings();
  }, [loadCourseOfferings]);

  return {
    courseOfferings: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadCourseOfferings,
  };
}
