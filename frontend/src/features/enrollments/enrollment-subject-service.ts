// frontend/src/features/enrollments/enrollment-subject-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { EnrollmentSubjectPayload } from "./types/enrollment-types";

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const enrollmentSubjectService = {
  async attach(payload: EnrollmentSubjectPayload): Promise<void> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      "/enrollment-subjects",
      payload,
    );
    ensureSuccess(response.data);
  },
  async remove(enrollmentSubjectId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/enrollment-subjects/${enrollmentSubjectId}`,
    );
    ensureSuccess(response.data);
  },
};
