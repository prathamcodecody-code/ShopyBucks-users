"use client";
import { useEffect } from "react";

// 1. Added 'type' to the Props definition
interface ToastProps {
  message: string;
  onClose: () => void;
  type?: "success" | "error"; // The '?' makes it optional
}

export default function Toast({ message, onClose, type = "success" }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // 2. Determine background color based on type
  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";

  return (
    <div
      className={`
        fixed top-5 right-5 ${bgColor} text-white px-4 py-2 
        rounded-lg shadow-lg text-sm z-50 animate-slide
      `}
    >
      <div className="flex items-center gap-2">
        {message}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
