// frontend/src/features/students/student-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { PaginatedResponse, Student, StudentPayload } from "./types/student-types";

export type StudentQuery = {
  page?: number;
  search?: string;
  archived?: boolean;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const studentService = {
  async list(query: StudentQuery): Promise<PaginatedResponse<Student>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(
      "/students",
      {
        params: {
          page: query.page,
          search: query.search || undefined,
          archived: query.archived ? 1 : undefined,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: StudentPayload): Promise<Student> {
    const response = await apiClient.post<ApiResponse<Student>>("/students", payload);
    return ensureSuccess(response.data);
  },
  async update(studentId: number, payload: StudentPayload): Promise<Student> {
    const response = await apiClient.put<ApiResponse<Student>>(
      `/students/${studentId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(studentId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/students/${studentId}`);
    ensureSuccess(response.data);
  },
  async restore(studentId: number): Promise<Student> {
    const response = await apiClient.post<ApiResponse<Student>>(
      `/students/${studentId}/restore`,
    );
    return ensureSuccess(response.data);
  },
};
