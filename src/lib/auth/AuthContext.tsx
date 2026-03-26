'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Administrador',
      email: 'admin@hecato.com',
      role: 'Administrador',
    },
  },
  vendedor: {
    password: 'venta123',
    user: {
      id: '2',
      name: 'Carlos Martínez',
      email: 'carlos@hecato.com',
      role: 'Vendedor',
    },
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hecato_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('hecato_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800)); // simulate API delay
    const match = MOCK_USERS[username.toLowerCase()];
    if (match && match.password === password) {
      setUser(match.user);
      localStorage.setItem('hecato_user', JSON.stringify(match.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('hecato_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
