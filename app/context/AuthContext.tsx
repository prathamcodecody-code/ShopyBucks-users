"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean; // ✅ Added
  isBlocked: boolean; 
  loginWithToken: (token: string) => void;
  logout: () => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // ✅ Added
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setToken(saved);
      fetchUser(saved);
    } else {
      setLoading(false); // ✅ No token, stop loading
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      setLoading(true); // ✅ Start loading
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
  const data = await res.json();
  setUser(data);
  setIsBlocked(data?.isBlocked || false); // ✅
} else {
        // Token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsBlocked(false);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // On error, clear invalid token
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  const loginWithToken = async (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
    await fetchUser(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout, setUser ,  isBlocked  }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
