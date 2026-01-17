"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { HiOutlineMapPin, HiOutlineChevronRight, HiOutlineShieldCheck } from "react-icons/hi2";

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { setAddress } = useCheckout();

  const [address, setAddressLocal] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setAddressLocal((prev) => ({ ...prev, [field]: value }));
  };

  const continueToPayment = () => {
    if (Object.values(address).some((v) => !v.trim())) {
      setError("Please fill all required address fields to proceed.");
      return;
    }

    setError("");
    setAddress(address);
    router.push("/checkout/payment");
  };

  return (
    <div className="bg-amazon-lightGray min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* --- CHECKOUT STEPS --- */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 text-amazon-orange">
            <span className="w-7 h-7 rounded-full bg-amazon-orange text-amazon-darkBlue flex items-center justify-center text-xs font-black">1</span>
            <span className="font-bold text-sm">Address</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-black">2</span>
            <span className="font-bold text-sm text-gray-400">Payment</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-black">3</span>
            <span className="font-bold text-sm text-gray-400">Review</span>
          </div>
        </div>

        {/* --- MAIN FORM --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-amazon-borderGray overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-amazon-orange/10 rounded-lg text-amazon-orange">
              <HiOutlineMapPin size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-amazon-text leading-tight">Delivery Address</h1>
              <p className="text-xs text-amazon-mutedText uppercase font-bold tracking-wider mt-0.5">Where should we send your order?</p>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Full Name"
                placeholder="First and last name"
                value={address.name}
                onChange={(v) => handleChange("name", v)}
              />

              <Field
                label="Mobile Number"
                type="tel"
                placeholder="10-digit mobile number"
                value={address.phone}
                onChange={(v) => handleChange("phone", v)}
              />

              <div className="md:col-span-2">
                <Field
                  label="Flat, House no., Building, Company, Apartment"
                  placeholder="Street address details"
                  value={address.street}
                  onChange={(v) => handleChange("street", v)}
                />
              </div>

              <Field
                label="Town/City"
                placeholder="City name"
                value={address.city}
                onChange={(v) => handleChange("city", v)}
              />

              <Field
                label="State"
                placeholder="State name"
                value={address.state}
                onChange={(v) => handleChange("state", v)}
              />

              <Field
                label="Pincode"
                type="number"
                placeholder="6 digits [0-9]"
                value={address.pincode}
                onChange={(v) => handleChange("pincode", v)}
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium border border-red-100">
                <span className="w-1 h-1 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-10 flex flex-col md:flex-row items-center gap-6">
              <button
                onClick={continueToPayment}
                className="w-full md:flex-1 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-2xl font-black text-lg transition-all shadow-md active:scale-[0.98]"
              >
                Use this address
              </button>
              
              <div className="flex items-center gap-2 text-[11px] font-bold text-amazon-success uppercase tracking-tighter">
                <HiOutlineShieldCheck size={18} />
                Secure Checkout Process
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-amazon-mutedText">
          Need help? <span className="underline cursor-pointer">Contact ShopyBucks Support</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------- FIELD COMPONENT ---------------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black text-amazon-text uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-amazon-text placeholder:text-gray-300 focus:ring-2 focus:ring-amazon-orange/20 focus:border-amazon-orange outline-none transition-all font-medium"
      />
    </div>
  );
}