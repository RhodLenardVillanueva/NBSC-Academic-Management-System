// frontend/src/features/course-offerings/course-offering-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type {
  CourseOffering,
  CourseOfferingPayload,
  PaginatedResponse,
} from "./types/course-offering-types";

export type CourseOfferingQuery = {
  page?: number;
};

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const courseOfferingService = {
  async list(query: CourseOfferingQuery): Promise<PaginatedResponse<CourseOffering>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CourseOffering>>>(
      "/course-offerings",
      {
        params: {
          page: query.page,
        },
      },
    );

    return ensureSuccess(response.data);
  },
  async create(payload: CourseOfferingPayload): Promise<CourseOffering> {
    const response = await apiClient.post<ApiResponse<CourseOffering>>(
      "/course-offerings",
      payload,
    );
    return ensureSuccess(response.data);
  },
  async update(
    courseOfferingId: number,
    payload: CourseOfferingPayload,
  ): Promise<CourseOffering> {
    const response = await apiClient.put<ApiResponse<CourseOffering>>(
      `/course-offerings/${courseOfferingId}`,
      payload,
    );
    return ensureSuccess(response.data);
  },
  async remove(courseOfferingId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/course-offerings/${courseOfferingId}`,
    );
    ensureSuccess(response.data);
  },
};
