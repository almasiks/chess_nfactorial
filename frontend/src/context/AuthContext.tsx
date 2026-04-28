"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MOCK_USER_KEY = "steppechess_mock_user";

export interface UserData {
  id: number;
  username: string;
  email: string;
  asyqs: number;
  level: string;
  level_display: string;
  city: string;
  city_display: string;
  rating: number;
  is_pro: boolean;
  avatar: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  city: string;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const createFallbackUser = (email: string, username?: string): UserData => {
    const safeName = username?.trim() || email.split("@")[0] || "Гость";
    return {
      id: 0,
      username: safeName,
      email,
      asyqs: 150,
      level: "Демобатыр",
      level_display: "Демобатыр",
      city: "Алматы",
      city_display: "Алматы",
      rating: 1500,
      is_pro: false,
      avatar: null,
    };
  };

  const persistFallbackUser = (userData: UserData) => {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(userData));
    localStorage.setItem("steppechess_profile", JSON.stringify({ displayName: userData.username, avatarKey: "batyr" }));
  };

  useEffect(() => {
    const token = localStorage.getItem("steppechess_access");
    if (!token) { setLoading(false); return; }

    fetch(`${API}/api/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) {
          throw new Error("Invalid");
        }
        return r.json();
      })
      .then(setUser)
      .catch(() => {
        if (token === "mock") {
          const stored = localStorage.getItem(MOCK_USER_KEY);
          if (stored) {
            try {
              setUser(JSON.parse(stored));
              return;
            } catch {
              /* ignore */ }
          }
        }
        localStorage.removeItem("steppechess_access");
        localStorage.removeItem("steppechess_refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOfflineLogin = (email: string, username?: string) => {
    const fallbackUser = createFallbackUser(email, username);
    localStorage.setItem("steppechess_access", "mock");
    localStorage.setItem("steppechess_refresh", "mock");
    persistFallbackUser(fallbackUser);
    setUser(fallbackUser);
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if (res.status >= 500) {
          handleOfflineLogin(email);
          return;
        }
        const err = await res.json();
        throw new Error(err.detail ?? "Ошибка входа");
      }
      const data = await res.json();
      localStorage.setItem("steppechess_access", data.access);
      localStorage.setItem("steppechess_refresh", data.refresh);
      setUser(data.user);
    } catch (error) {
      if (error instanceof TypeError) {
        handleOfflineLogin(email);
        return;
      }
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch(`${API}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status >= 500) {
          handleOfflineLogin(data.email, data.username);
          return;
        }
        const err = await res.json();
        const msgs = Object.entries(err).map(([, v]) =>
          Array.isArray(v) ? v.join(", ") : String(v)
        );
        throw new Error(msgs.join("; ") || "Ошибка регистрации");
      }
      const result = await res.json();
      localStorage.setItem("steppechess_access", result.access);
      localStorage.setItem("steppechess_refresh", result.refresh);
      setUser(result.user);
    } catch (error) {
      if (error instanceof TypeError) {
        handleOfflineLogin(data.email, data.username);
        return;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("steppechess_access");
    localStorage.removeItem("steppechess_refresh");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
