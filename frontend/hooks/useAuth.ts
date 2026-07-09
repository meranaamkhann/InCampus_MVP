"use client";

import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { ApiResponse, AuthResponse } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { setSession, clearSession, userId, name, accessToken } = useAuthStore();

  async function login(email: string, password: string) {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password });
    const data = res.data.data;
    setSession({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    router.push("/feed");
  }

  async function verifyOtp(email: string, otp: string) {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/verify-otp", { email, otp });
    const data = res.data.data;
    setSession({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    router.push("/feed");
  }

  function logout() {
    clearSession();
    router.push("/login");
  }

  return { login, verifyOtp, logout, userId, name, isAuthenticated: !!accessToken };
}

export { apiErrorMessage };
