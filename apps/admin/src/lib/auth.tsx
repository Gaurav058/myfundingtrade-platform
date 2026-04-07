"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { UserWithProfile } from "@myfundingtrade/types";
import { getStoredToken, setStoredToken, removeStoredToken } from "./auth-store";

const API_BASE = "/api/v1";

interface AuthState {
  user: UserWithProfile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  refreshAuth: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    setStoredToken(token);
  } else {
    removeStoredToken();
  }
}

function setSessionCookie() {
  document.cookie = "session=1; path=/; max-age=604800; samesite=lax";
}

function clearSessionCookie() {
  document.cookie = "session=; path=/; max-age=0";
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  const refreshAuth = useCallback(async (): Promise<string | null> => {
    if (refreshPromise.current) return refreshPromise.current;

    refreshPromise.current = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          accessToken = null;
          removeStoredToken();
          clearSessionCookie();
          setState({ user: null, loading: false });
          return null;
        }
        const json = await res.json();
        accessToken = json.data?.accessToken ?? json.accessToken;
        return accessToken;
      } catch {
        accessToken = null;
        removeStoredToken();
        clearSessionCookie();
        setState({ user: null, loading: false });
        return null;
      } finally {
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  }, []);

  useEffect(() => {
    const adminRoles = ["SUPER_ADMIN", "FINANCE_ADMIN", "KYC_REVIEWER", "SUPPORT_AGENT", "CONTENT_ADMIN"];

    async function tryFetchMe(token: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const user = json.data ?? json;
          if (adminRoles.includes(user.role)) {
            accessToken = token;
            setStoredToken(token);
            setSessionCookie();
            setState({ user, loading: false });
            return true;
          }
        }
      } catch { /* fall through */ }
      return false;
    }

    async function init() {
      // 1. Try stored token from localStorage
      const stored = getStoredToken();
      if (stored) {
        if (await tryFetchMe(stored)) return;
      }

      // 2. Stored token missing or expired — try refresh
      const refreshed = await refreshAuth();
      if (refreshed) {
        if (await tryFetchMe(refreshed)) return;
      }

      // 3. Everything failed — not authenticated
      accessToken = null;
      removeStoredToken();
      clearSessionCookie();
      setState({ user: null, loading: false });
    }
    init();
  }, [refreshAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.message || json.error || "Login failed" };
      }
      const payload = json.data ?? json;
      const adminRoles = ["SUPER_ADMIN", "FINANCE_ADMIN", "KYC_REVIEWER", "SUPPORT_AGENT", "CONTENT_ADMIN"];
      if (!adminRoles.includes(payload.user?.role)) {
        return { success: false, error: "Access denied. Admin role required." };
      }
      accessToken = payload.accessToken;
      setStoredToken(payload.accessToken);
      setSessionCookie();
      setState({ user: payload.user, loading: false });
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
    } catch { /* best-effort */ }
    accessToken = null;
    removeStoredToken();
    clearSessionCookie();
    setState({ user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, getAccessToken: () => accessToken, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
