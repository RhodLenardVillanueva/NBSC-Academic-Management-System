// frontend/src/features/transcript/transcript-service.ts
import { apiClient } from "../../app/api/api-client";
import type { ApiResponse } from "../../shared/types/api";
import type { Transcript } from "./types/transcript-types";

const ensureSuccess = <TData>(response: ApiResponse<TData>): TData => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
};

export const transcriptService = {
  async get(studentId: number): Promise<Transcript> {
    const response = await apiClient.get<ApiResponse<Transcript>>(
      `/students/${studentId}/transcript`,
    );
    return ensureSuccess(response.data);
  },
};
