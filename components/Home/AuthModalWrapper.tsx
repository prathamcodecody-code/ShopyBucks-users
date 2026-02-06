"use client";

import { useAuthModal } from "@/app/auth/AuthModalContext";
import AuthModal from "@/app/auth/AuthModal";
import RegisterModal from "@/app/auth/RegisterModal";

export default function AuthModalWrapper() {
  const { mode, close } = useAuthModal();

  if (!mode) return null;

  if (mode === "login") {
    return <AuthModal show onClose={close} />;
  }

  if (mode === "register") {
    return <RegisterModal show onClose={close} />;
  }

  return null;
}
