// frontend/src/features/faculty/faculty-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type {
  FacultyMember,
  FacultyPayload,
  PaginatedResponse,
} from "./types/faculty-types";

export type FacultyQuery = {
  page?: number;
  search?: string;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const facultyService = {
  async list(query: FacultyQuery): Promise<PaginatedResponse<FacultyMember>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<FacultyMember>>>(
      "/faculty",
      {
        params: {
          page: query.page,
          search: query.search || undefined,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: FacultyPayload): Promise<FacultyMember> {
    const response = await apiClient.post<ApiResponse<FacultyMember>>(
      "/faculty",
      payload,
    );
    return ensureSuccess(response.data);
  },
  async update(facultyId: number, payload: FacultyPayload): Promise<FacultyMember> {
    const response = await apiClient.put<ApiResponse<FacultyMember>>(
      `/faculty/${facultyId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(facultyId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`/faculty/${facultyId}`);
    ensureSuccess(response.data);
  },
};
