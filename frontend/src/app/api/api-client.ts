// frontend/src/app/api/api-client.ts
import axios, { type AxiosError, type AxiosInstance } from "axios";

type AuthHandlers = {
  getToken: () => string | null;
  onUnauthorized: () => void | Promise<void>;
};

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is not set");
}

const authHandlers: AuthHandlers = {
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export const setAuthHandlers = (handlers: Partial<AuthHandlers>): void => {
  Object.assign(authHandlers, handlers);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = authHandlers.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await authHandlers.onUnauthorized();
    }
    return Promise.reject(error);
  },
);
