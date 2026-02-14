// frontend/src/features/assessment/assessment-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { AssessmentCreatePayload, EnrollmentAssessment } from "./assessment-types";

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const assessmentService = {
  async getByEnrollment(enrollmentId: number): Promise<EnrollmentAssessment | null> {
    const response = await apiClient.get<ApiResponse<EnrollmentAssessment | null>>(
      `/enrollments/${enrollmentId}/assessment`,
    );
    return ensureSuccess(response.data);
  },
  async createForEnrollment(
    enrollmentId: number,
    payload: AssessmentCreatePayload,
  ): Promise<EnrollmentAssessment> {
    const response = await apiClient.post<ApiResponse<EnrollmentAssessment>>(
      `/enrollments/${enrollmentId}/assessment`,
      payload,
    );
    return ensureSuccess(response.data);
  },
};
