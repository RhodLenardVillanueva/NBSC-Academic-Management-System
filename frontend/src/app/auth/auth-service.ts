// frontend/src/app/auth/auth-service.ts
import { apiClient } from "../api/api-client";
import type { ApiResponse, LoginRequest, LoginResponse, User } from "./auth-types";

export const authService = {
  async login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/login",
      payload,
    );
    return response.data;
  },
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },
  async whoami(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/whoami");
    return response.data;
  },
};
