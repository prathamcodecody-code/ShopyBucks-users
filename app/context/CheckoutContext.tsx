"use client";

import { createContext, useContext, useState, useEffect } from "react";

type CheckoutContextType = {
  addressId: number | null;
  setAddressId: (id: number | null) => void;

  paymentMethod: string | null;
  setPaymentMethod: (m: string | null) => void;

  resetCheckout: () => void;
  
  isHydrated: boolean;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [addressId, setAddressIdState] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethodState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("checkout");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.addressId) setAddressIdState(data.addressId);
        if (data.paymentMethod) setPaymentMethodState(data.paymentMethod);
      } catch (e) {
        console.error("Failed to parse checkout data");
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever values change
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem(
        "checkout",
        JSON.stringify({ addressId, paymentMethod })
      );
    }
  }, [addressId, paymentMethod, isHydrated]);

  const setAddressId = (id: number | null) => {
    setAddressIdState(id);
  };

  const setPaymentMethod = (m: string | null) => {
    setPaymentMethodState(m);
  };

  const resetCheckout = () => {
    setAddressIdState(null);
    setPaymentMethodState(null);
    sessionStorage.removeItem("checkout");
  };

  return (
    <CheckoutContext.Provider
      value={{
        addressId,
        setAddressId,
        paymentMethod,
        setPaymentMethod,
        resetCheckout,
        isHydrated,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used inside CheckoutProvider");
  }
  return ctx;
};
