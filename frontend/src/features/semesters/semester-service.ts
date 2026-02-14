// frontend/src/features/semesters/semester-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { PaginatedResponse, Semester, SemesterPayload } from "./types/semester-types";

export type SemesterQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const semesterService = {
  async list(query: SemesterQuery): Promise<PaginatedResponse<Semester>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Semester>>>(
      "/semesters",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: SemesterPayload): Promise<Semester> {
    const response = await apiClient.post<ApiResponse<Semester>>("/semesters", payload);
    return ensureSuccess(response.data);
  },
  async update(semesterId: number, payload: SemesterPayload): Promise<Semester> {
    const response = await apiClient.put<ApiResponse<Semester>>(
      `/semesters/${semesterId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(semesterId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/semesters/${semesterId}`);
    ensureSuccess(response.data);
  },
};
