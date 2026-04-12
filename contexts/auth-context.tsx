"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  hasPassword: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mounted: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: "google" | "github" | "discord") => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string | undefined, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_CACHE_KEY = "colecao-virtual-auth-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAuth = async () => {
      const cachedUser = window.localStorage.getItem(AUTH_CACHE_KEY);

      if (!window.navigator.onLine && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          window.localStorage.removeItem(AUTH_CACHE_KEY);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await apiClient.get("/auth/me");
        if (response.data.user) {
          setUser(response.data.user);
          window.localStorage.setItem(
            AUTH_CACHE_KEY,
            JSON.stringify(response.data.user)
          );
        } else {
          window.localStorage.removeItem(AUTH_CACHE_KEY);
        }
      } catch (error) {
        if (!window.navigator.onLine && cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch {
            window.localStorage.removeItem(AUTH_CACHE_KEY);
          }
        }
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      setUser(response.data.user);
      window.localStorage.setItem(
        AUTH_CACHE_KEY,
        JSON.stringify(response.data.user)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", {
        email,
        password,
        name,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" | "github" | "discord") => {
    await signIn(provider, { callbackUrl: "/dashboard" });
  };

  const changePassword = async (currentPassword: string | undefined, newPassword: string) => {
    await apiClient.patch("/auth/password", { currentPassword, newPassword });
    // Se o usuário não tinha senha (OAuth), agora tem — atualiza o estado
    if (user && !user.hasPassword) {
      const nextUser = { ...user, hasPassword: true };
      setUser(nextUser);
      window.localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(nextUser));
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        apiClient.post("/auth/logout"),
        signOut({ redirect: false }),
      ]);
      setUser(null);
      window.localStorage.removeItem(AUTH_CACHE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, mounted, login, loginWithOAuth, register, logout, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
