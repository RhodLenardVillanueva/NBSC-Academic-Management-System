// frontend/src/features/enrollments/enrollment-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type {
  Enrollment,
  EnrollmentCor,
  EnrollmentPayload,
  PaginatedResponse,
} from "./types/enrollment-types";

export type EnrollmentQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const enrollmentService = {
  async list(query: EnrollmentQuery): Promise<PaginatedResponse<Enrollment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Enrollment>>>(
      "/enrollments",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: EnrollmentPayload): Promise<Enrollment> {
    const response = await apiClient.post<ApiResponse<Enrollment>>(
      "/enrollments",
      payload,
    );
    return ensureSuccess(response.data);
  },
  async update(enrollmentId: number, payload: EnrollmentPayload): Promise<Enrollment> {
    const response = await apiClient.put<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(enrollmentId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/enrollments/${enrollmentId}`,
    );
    ensureSuccess(response.data);
  },
  async get(enrollmentId: number): Promise<Enrollment> {
    const response = await apiClient.get<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}`,
    );
    return ensureSuccess(response.data);
  },
  async cor(enrollmentId: number): Promise<EnrollmentCor> {
    const response = await apiClient.get<ApiResponse<EnrollmentCor>>(
      `/enrollments/${enrollmentId}/cor`,
    );
    return ensureSuccess(response.data);
  },
};
