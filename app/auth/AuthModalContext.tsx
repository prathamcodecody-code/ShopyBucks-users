"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthMode = "login" | "register" | null;

type AuthModalContextType = {
  mode: AuthMode;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>(null);

  return (
    <AuthModalContext.Provider 
      value={{
        mode,
        openLogin: () => setMode("login"),
        openRegister: () => setMode("register"),
        close: () => setMode(null),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal must be used within AuthModalProvider");
  return context;
}
