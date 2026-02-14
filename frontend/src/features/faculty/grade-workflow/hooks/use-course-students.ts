// frontend/src/features/faculty/grade-workflow/hooks/use-course-students.ts
// Faculty grade workflow hooks for enrolled students per offering.

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../../../app/api/api-client";
import type { ApiResponse } from "../../../../shared/types/api";
import type { CourseOfferingStudentsResponse } from "../types/grade-types";

type UseCourseStudentsState = {
  data: CourseOfferingStudentsResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ensureSuccess = <TData,>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export function useCourseStudents(offeringId: number | null): UseCourseStudentsState {
  const [data, setData] = useState<CourseOfferingStudentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!offeringId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ApiResponse<CourseOfferingStudentsResponse>>(
        `/course-offerings/${offeringId}/students`,
      );
      const payload = ensureSuccess(response.data);
      setData(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load course offering students.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [offeringId]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  return {
    data,
    isLoading,
    error,
    refresh: loadStudents,
  };
}
