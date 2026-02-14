// frontend/src/features/programs/program-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { PaginatedResponse, Program, ProgramPayload } from "./program-types";

export type ProgramQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const programService = {
  async list(query: ProgramQuery): Promise<PaginatedResponse<Program>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Program>>>(
      "/programs",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: ProgramPayload): Promise<Program> {
    const response = await apiClient.post<ApiResponse<Program>>("/programs", payload);
    return ensureSuccess(response.data);
  },
  async update(programId: number, payload: ProgramPayload): Promise<Program> {
    const response = await apiClient.put<ApiResponse<Program>>(
      `/programs/${programId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(programId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/programs/${programId}`);
    ensureSuccess(response.data);
  },
};
