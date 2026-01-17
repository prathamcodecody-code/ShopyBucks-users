"use client";

import { createContext, useContext, useState } from "react";

type Address = {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

type CheckoutContextType = {
  address: Address | null;
  setAddress: (a: Address) => void;
  paymentMethod: string | null;
  setPaymentMethod: (m: string) => void;
  resetCheckout: () => void;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const resetCheckout = () => {
    setAddress(null);
    setPaymentMethod(null);
  };

  return (
    <CheckoutContext.Provider
      value={{ address, setAddress, paymentMethod, setPaymentMethod, resetCheckout }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used inside CheckoutProvider");
  return ctx;
};
