"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { HiXMark, HiOutlineShieldCheck } from "react-icons/hi2";
import { Input, PrimaryButton, SecondaryButton, BackButton, OtpStep } from "@/components/Home/AuthComponents";

type Step = "choice" | "signup" | "signupOtp" | "loginPassword" | "loginOtp" | "loginOtpVerify";

export default function AuthModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { loginWithToken } = useAuth();
  const [step, setStep] = useState<Step>("choice");
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  if (!show) return null;

  const handleSignup = async () => {
    setLoading(true);
    try {
      await api.post("/auth/signup", { name, email, phone, password });
      setStep("signupOtp");
    } finally { setLoading(false); }
  };

  const handleVerifySignup = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/signup/verify-otp", { phone, otp });
      loginWithToken(res.data.token);
      onClose();
    } finally { setLoading(false); }
  };

  const handleLoginPassword = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/password", { email, password });
      loginWithToken(res.data.token);
      onClose();
    } finally { setLoading(false); }
  };

  const handleSendLoginOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/login/otp/send", { phone });
      setStep("loginOtpVerify");
    } finally { setLoading(false); }
  };

  const handleVerifyLoginOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login/otp/verify", { phone, otp });
      loginWithToken(res.data.token);
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-amazon-darkBlue/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[420px] rounded-[2rem] shadow-2xl p-10 relative animate-in zoom-in-95 duration-300">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
          <HiXMark size={24} />
        </button>

        {/* --- CHOICE STEP --- */}
        {step === "choice" && (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Welcome</h2>
              <p className="text-gray-500 text-sm">Join ShopyBucks or Sign in to continue</p>
            </div>
            <div className="space-y-3">
              <PrimaryButton onClick={() => setStep("signup")}>Create Account</PrimaryButton>
              <SecondaryButton onClick={() => setStep("loginPassword")}>Login with Password</SecondaryButton>
              <SecondaryButton onClick={() => setStep("loginOtp")}>Login with OTP</SecondaryButton>
            </div>
          </div>
        )}

        {/* --- SIGNUP STEP --- */}
        {step === "signup" && (
          <div className="space-y-5">
            <BackButton onClick={() => setStep("choice")} />
            <h3 className="text-xl font-black">Create Account</h3>
            <div className="space-y-3">
              <Input placeholder="Full Name" value={name} onChange={setName} />
              <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
              <Input placeholder="Phone" type="tel" value={phone} onChange={setPhone} />
              <Input placeholder="Password" type="password" value={password} onChange={setPassword} />
            </div>
            <PrimaryButton loading={loading} onClick={handleSignup}>Create Account</PrimaryButton>
          </div>
        )}

        {/* --- LOGIN PASSWORD --- */}
        {step === "loginPassword" && (
          <div className="space-y-5">
            <BackButton onClick={() => setStep("choice")} />
            <h3 className="text-xl font-black">Welcome Back</h3>
            <div className="space-y-3">
              <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
              <Input placeholder="Password" type="password" value={password} onChange={setPassword} />
            </div>
            <PrimaryButton loading={loading} onClick={handleLoginPassword}>Login</PrimaryButton>
          </div>
        )}

        {/* --- LOGIN OTP REQUEST --- */}
        {step === "loginOtp" && (
          <div className="space-y-5">
            <BackButton onClick={() => setStep("choice")} />
            <h3 className="text-xl font-black">OTP Login</h3>
            <Input placeholder="Phone Number" type="tel" value={phone} onChange={setPhone} />
            <PrimaryButton loading={loading} onClick={handleSendLoginOtp}>Send Code</PrimaryButton>
          </div>
        )}

        {/* --- OTP VERIFICATION (COMMON) --- */}
        {(step === "signupOtp" || step === "loginOtpVerify") && (
          <OtpStep
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            onVerify={step === "signupOtp" ? handleVerifySignup : handleVerifyLoginOtp}
            onBack={() => setStep(step === "signupOtp" ? "signup" : "loginOtp")}
          />
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amazon-success">
          <HiOutlineShieldCheck size={16} /> 256-Bit SSL Secured
        </div>
      </div>
    </div>
  );
}
