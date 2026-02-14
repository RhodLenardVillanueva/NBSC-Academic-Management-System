// frontend/src/shared/types/api.ts
export type ApiErrors = Record<string, string[]> | string[] | string;

export type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
  errors?: ApiErrors;
};
