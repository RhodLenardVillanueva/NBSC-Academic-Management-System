// frontend/src/features/subjects/subject-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { PaginatedResponse, Subject, SubjectPayload } from "./types/subject-types";

export type SubjectQuery = {
  page?: number;
  search?: string;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const subjectService = {
  async list(query: SubjectQuery): Promise<PaginatedResponse<Subject>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Subject>>>(
      "/subjects",
      {
        params: {
          page: query.page,
          search: query.search || undefined,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: SubjectPayload): Promise<Subject> {
    const response = await apiClient.post<ApiResponse<Subject>>("/subjects", payload);
    return ensureSuccess(response.data);
  },
  async update(subjectId: number, payload: SubjectPayload): Promise<Subject> {
    const response = await apiClient.put<ApiResponse<Subject>>(
      `/subjects/${subjectId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(subjectId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/subjects/${subjectId}`);
    ensureSuccess(response.data);
  },
};
