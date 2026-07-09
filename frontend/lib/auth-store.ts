"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types";

interface AuthState {
  userId: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: {
    userId: string;
    name: string;
    email: string;
    role: Role;
    accessToken: string;
    refreshToken: string;
  }) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      name: null,
      email: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      setSession: (session) => set({ ...session }),
      clearSession: () =>
        set({
          userId: null,
          name: null,
          email: null,
          role: null,
          accessToken: null,
          refreshToken: null,
        }),
      isAuthenticated: () => !!get().accessToken,
    }),
    { name: "incampus-auth" }
  )
);
