// frontend/src/features/programs/use-programs.ts
import { useCallback, useEffect, useState } from "react";
import { programService } from "./program-service";
import type { PaginatedResponse, Program } from "./program-types";

type UseProgramsState = {
  programs: Program[];
  pagination: PaginatedResponse<Program>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<Program> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function usePrograms(page: number): UseProgramsState {
  const [pagination, setPagination] =
    useState<PaginatedResponse<Program>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await programService.list({ page });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load programs.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  return {
    programs: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadPrograms,
  };
}
