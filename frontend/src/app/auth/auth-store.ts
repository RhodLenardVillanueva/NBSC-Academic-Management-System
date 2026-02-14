// frontend/src/app/auth/auth-store.ts
import { create } from "zustand";
import { setAuthHandlers } from "../api/api-client";
import { authService } from "./auth-service";
import type { User } from "./auth-types";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hydrateFromStorage: () => Promise<void>;
};

const TOKEN_KEY = "nbsc-sims.token";

const clearAuthState = (set: (state: Partial<AuthState>) => void): void => {
  localStorage.removeItem(TOKEN_KEY);
  set({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const loginResult = await authService.login({ email, password });
      if (!loginResult.success) {
        throw new Error(loginResult.message);
      }

      const token = loginResult.data.token;
      localStorage.setItem(TOKEN_KEY, token);
      set({ token, isAuthenticated: true });

      const whoamiResult = await authService.whoami();
      if (!whoamiResult.success) {
        throw new Error(whoamiResult.message);
      }

      set({ user: whoamiResult.data, isLoading: false });
    } catch (error) {
      clearAuthState(set);
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      clearAuthState(set);
    }
  },
  setUser: (user) => {
    set({ user });
  },
  hydrateFromStorage: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      clearAuthState(set);
      return;
    }

    set({ token, isAuthenticated: true, isLoading: true });

    try {
      const whoamiResult = await authService.whoami();
      if (!whoamiResult.success) {
        throw new Error(whoamiResult.message);
      }
      set({ user: whoamiResult.data, isLoading: false });
    } catch {
      clearAuthState(set);
    }
  },
}));

const resetAuthState = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });
};

setAuthHandlers({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    resetAuthState();
  },
});

void useAuthStore.getState().hydrateFromStorage();
