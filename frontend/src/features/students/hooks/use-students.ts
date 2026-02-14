// frontend/src/features/students/hooks/use-students.ts
import { useCallback, useEffect, useState } from "react";
import { studentService } from "../student-service";
import type { PaginatedResponse, Student } from "../types/student-types";

type UseStudentsState = {
  students: Student[];
  pagination: PaginatedResponse<Student>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyPagination: PaginatedResponse<Student> = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
};

export function useStudents(
  page: number,
  search: string,
  archived: boolean,
): UseStudentsState {
  const [pagination, setPagination] =
    useState<PaginatedResponse<Student>>(emptyPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await studentService.list({ page, search, archived });
      setPagination(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load students.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, archived]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  return {
    students: pagination.data,
    pagination,
    isLoading,
    error,
    refresh: loadStudents,
  };
}
