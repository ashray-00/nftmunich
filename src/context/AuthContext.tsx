"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  role: "player" | "admin" | "super_admin";
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("nft_session");
      if (token) {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          if (payload.exp && payload.exp * 1000 > Date.now() && payload.email) {
            const role: User["role"] =
              payload.role === "super_admin" ? "super_admin"
              : payload.role === "admin" ? "admin"
              : "player";
            setUser({ email: payload.email, role });
          } else {
            localStorage.removeItem("nft_session");
          }
        }
      }
    } catch {
      localStorage.removeItem("nft_session");
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("nft_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
