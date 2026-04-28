"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

  useEffect(() => {
    const token = localStorage.getItem("steppechess_access");
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error("Invalid"); return r.json(); })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("steppechess_access");
        localStorage.removeItem("steppechess_refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Ошибка входа");
    }
    const data = await res.json();
    localStorage.setItem("steppechess_access", data.access);
    localStorage.setItem("steppechess_refresh", data.refresh);
    setUser(data.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch(`${API}/api/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
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
