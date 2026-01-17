"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean; // 1. ADD THIS LINE
  loginWithToken: (token: string) => void;
  logout: () => void;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 2. ADD THIS STATE (Start as true)

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setToken(saved);
      fetchUser(saved);
    } else {
      setLoading(false); // 3. Set to false if no token exists
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      setLoading(true); // 4. Set loading while fetching
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } finally {
      setLoading(false); // 5. Always set loading to false when done
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
    // 6. PASS LOADING IN THE VALUE
    <AuthContext.Provider value={{ user, token, loading, loginWithToken, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
