"use client";

import AuthModal from "@/app/auth/AuthModal";
import { useAuthModal } from "@/app/auth/AuthModalContext";

export default function AuthModalWrapper() {
  const { isOpen, closeAuthModal } = useAuthModal();
  
  return <AuthModal show={isOpen} onClose={closeAuthModal} />;
}