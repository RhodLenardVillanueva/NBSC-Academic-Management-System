// frontend/src/features/instructors/instructor-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { Instructor, PaginatedResponse } from "./types/instructor-types";

export type InstructorQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const instructorService = {
  async list(query: InstructorQuery): Promise<PaginatedResponse<Instructor>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Instructor>>>(
      "/instructors",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
};
