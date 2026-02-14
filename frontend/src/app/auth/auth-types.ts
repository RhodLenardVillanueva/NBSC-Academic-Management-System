// frontend/src/app/auth/auth-types.ts
export type { ApiResponse } from "../../shared/types/api";

export type User = {
  id: number;
  name: string;
  email: string;
  roles?: Array<{
    id: number;
    name: string;
  }>;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};
