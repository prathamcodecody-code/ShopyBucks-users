"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { HiXMark, HiOutlineArrowLeft, HiOutlineShieldCheck } from "react-icons/hi2";

export default function AuthModal({ show, onClose }: any) {
  const { loginWithToken } = useAuth();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone || !name || !email) return;
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone, name, email });
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { phone, otp });
      loginWithToken(res.data.token);
      window.dispatchEvent(new Event("auth-changed"));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-amazon-darkBlue/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full text-amazon-mutedText transition-colors"
        >
          <HiXMark size={24} />
        </button>

        <div className="p-10">
          {step === "details" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-amazon-text tracking-tight">Create Account</h2>
                <p className="text-xs text-amazon-mutedText uppercase font-bold tracking-widest">Join Shopy Bucks today</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-amazon-text uppercase ml-1">Full Name</label>
                  <input
                    placeholder="First and last name"
                    className="w-full border border-gray-300 focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 outline-none p-3.5 rounded-xl transition-all font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-amazon-text uppercase ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full border border-gray-300 focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 outline-none p-3.5 rounded-xl transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-amazon-text uppercase ml-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    className="w-full border border-gray-300 focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 outline-none p-3.5 rounded-xl transition-all font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-black py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Sending Code..." : "Continue"}
              </button>

              <p className="text-[10px] text-center text-amazon-mutedText px-4 leading-relaxed uppercase font-bold tracking-tight">
                By continuing, you agree to our <span className="text-amazon-darkBlue underline cursor-pointer">Terms of Service</span> and <span className="text-amazon-darkBlue underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <button 
                onClick={() => setStep("details")}
                className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText hover:text-amazon-text transition-colors"
              >
                <HiOutlineArrowLeft /> Change Details
              </button>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-amazon-text tracking-tight">Verify Identity</h2>
                <p className="text-xs text-amazon-mutedText font-medium">
                  We've sent a 6-digit code to <span className="font-black text-amazon-text">{phone}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-amazon-text uppercase ml-1">One-Time Password</label>
                <input
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="w-full border border-gray-300 focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 outline-none p-4 rounded-xl text-center text-2xl font-black tracking-[0.5em] transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <button
                onClick={verifyOtp}
                disabled={loading}
                className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-black py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Secure Login"}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-amazon-success uppercase tracking-widest bg-green-50 py-2 rounded-lg">
                <HiOutlineShieldCheck size={16} /> 256-Bit Encrypted
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}