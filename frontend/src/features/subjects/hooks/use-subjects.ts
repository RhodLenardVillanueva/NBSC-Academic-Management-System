// frontend/src/features/subjects/hooks/use-subjects.ts
import { useCallback, useEffect, useState } from "react";
import { subjectService } from "../subject-service";
import type { PaginatedResponse, Subject } from "../types/subject-types";

type UseSubjectsState = {
  subjects: Subject[];
  pagination: PaginatedResponse<Subject>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<Subject> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useSubjects(page: number, search: string): UseSubjectsState {
  const [pagination, setPagination] =
    useState<PaginatedResponse<Subject>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await subjectService.list({ page, search });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load subjects.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadSubjects();
  }, [loadSubjects]);

  return {
    subjects: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadSubjects,
  };
}
