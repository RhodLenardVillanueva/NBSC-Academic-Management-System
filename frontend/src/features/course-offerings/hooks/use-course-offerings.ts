// frontend/src/features/course-offerings/hooks/use-course-offerings.ts
import { useCallback, useEffect, useState } from "react";
import { courseOfferingService } from "../course-offering-service";
import type {
  CourseOffering,
  PaginatedResponse,
} from "../types/course-offering-types";

type UseCourseOfferingsState = {
  courseOfferings: CourseOffering[];
  pagination: PaginatedResponse<CourseOffering>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<CourseOffering> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useCourseOfferings(page: number): UseCourseOfferingsState {
  const [pagination, setPagination] =
    useState<PaginatedResponse<CourseOffering>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseOfferings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await courseOfferingService.list({ page });
      setPagination(result);
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
