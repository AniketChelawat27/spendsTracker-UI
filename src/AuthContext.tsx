import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { apiUrl } from './api';

const API_BASE = import.meta.env.VITE_API_URL || '';

export type AuthUser = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AUTH_STORAGE_KEY = 'spend_tracker_auth';
type StoredAuth = { token: string; user: AuthUser };

function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuth;
    if (data?.token && data?.user?.id && data?.user?.email) return data;
    return null;
  } catch {
    return null;
  }
}

function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const auth = getStoredAuth();
    return auth?.token ?? null;
  }, []);

  useEffect(() => {
    const auth = getStoredAuth();
    setUser(auth?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        if (!config.url?.startsWith('/api') && !config.url?.startsWith(API_BASE)) return config;
        const token = await getIdToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (e) => Promise.reject(e)
    );
    return () => axios.interceptors.request.eject(interceptor);
  }, [getIdToken]);

  const signIn = useCallback(async (email: string, password: string) => {
    const url = apiUrl('/api/auth/login');
    const res = await axios.post<{ token: string; user: AuthUser }>(url, { email, password });
    const { token, user: u } = res.data;
    setStoredAuth({ token, user: u });
    setUser(u);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const url = apiUrl('/api/auth/signup');
    const res = await axios.post<{ token: string; user: AuthUser }>(url, { email, password });
    const { token, user: u } = res.data;
    setStoredAuth({ token, user: u });
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getIdToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
