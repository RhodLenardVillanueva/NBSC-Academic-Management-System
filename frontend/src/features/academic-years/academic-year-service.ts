// frontend/src/features/academic-years/academic-year-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type {
  AcademicYear,
  AcademicYearPayload,
  PaginatedResponse,
} from "./types/academic-year-types";

export type AcademicYearQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const academicYearService = {
  async list(query: AcademicYearQuery): Promise<PaginatedResponse<AcademicYear>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<AcademicYear>>>(
      "/academic-years",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: AcademicYearPayload): Promise<AcademicYear> {
    const response = await apiClient.post<ApiResponse<AcademicYear>>(
      "/academic-years",
      payload,
    );
    return ensureSuccess(response.data);
  },
  async update(academicYearId: number, payload: AcademicYearPayload): Promise<AcademicYear> {
    const response = await apiClient.put<ApiResponse<AcademicYear>>(
      `/academic-years/${academicYearId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(academicYearId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/academic-years/${academicYearId}`,
    );
    ensureSuccess(response.data);
  },
};
