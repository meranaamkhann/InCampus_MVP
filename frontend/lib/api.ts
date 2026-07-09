import axios, { AxiosError } from "axios";
import { useAuthStore } from "./auth-store";
import { toast } from "./toast-store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NOTE: the backend's POST /api/auth/refresh handles rotation now, but this
// interceptor doesn't yet attempt a silent refresh-and-retry on 401 - it
// just clears the session and bounces to /login. Wiring an actual refresh
// attempt here (queue the failed request, refresh, retry once) is the next
// step if you want users to never see a forced re-login mid-session.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      // Request never reached the server - backend down, no internet, CORS, etc.
      toast.error("Connection problem", "Couldn't reach the server. Check your connection and try again.");
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      const wasAuthenticated = !!useAuthStore.getState().accessToken;
      useAuthStore.getState().clearSession();
      if (typeof window !== "undefined") {
        if (wasAuthenticated) toast.error("Session expired", "Please log in again.");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}
