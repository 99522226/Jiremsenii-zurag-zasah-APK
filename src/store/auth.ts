"use client";
import { create } from "zustand";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  language: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_token", token);
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
    set({ user: null, token: null });
  },
  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const user = localStorage.getItem("auth_user");
      const token = localStorage.getItem("auth_token");
      if (user && token) {
        set({ user: JSON.parse(user), token });
      }
    } catch {
      // ignore
    }
  },
}));
