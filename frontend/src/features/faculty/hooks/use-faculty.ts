// frontend/src/features/faculty/hooks/use-faculty.ts
import { useCallback, useEffect, useState } from "react";
import { facultyService } from "../faculty-service";
import type { FacultyMember, PaginatedResponse } from "../types/faculty-types";

type UseFacultyState = {
  faculty: FacultyMember[];
  pagination: PaginatedResponse<FacultyMember>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<FacultyMember> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useFaculty(page: number, search: string): UseFacultyState {
  const [pagination, setPagination] = useState<PaginatedResponse<FacultyMember>>(
    emptyPagination,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFaculty = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await facultyService.list({ page, search });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load faculty.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadFaculty();
  }, [loadFaculty]);

  return {
    faculty: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadFaculty,
  };
}
