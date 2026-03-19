"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useAuthModal } from "@/app/auth/AuthModalContext";
import { HiXMark } from "react-icons/hi2";
import { Input, PrimaryButton } from "@/components/Home/AuthComponents";
import { Gift, CheckCircle, XCircle } from "lucide-react";

type Step = "form" | "otp";

export default function RegisterModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const { loginWithToken } = useAuth();
  const { openLogin } = useAuthModal();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
  });

  // Referral validation state
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>("");

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otp, setOtp] = useState("");

  // Validation Logic
  const validate = (name: string, value: string) => {
    let error = "";
    if (name === "name" && value.length < 2) error = "Name is too short";
    if (name === "email" && !/\S+@\S+\.\S+/.test(value)) error = "Invalid email format";
    if (name === "phone" && !/^\d{10}$/.test(value)) error = "Enter 10-digit number";
    if (name === "password" && value.length < 6) error = "Minimum 6 characters";
    
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ✅ Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setReferralValid(null);
      setReferrerName("");
      return;
    }

    setReferralValidating(true);
    try {
      const res = await api.get(`/referral/validate?code=${code}`); // ✅ Fixed URL
      if (res.data.valid) {
        setReferralValid(true);
        setReferrerName(res.data.referrer.name || "Someone");
      } else {
        setReferralValid(false);
        setReferrerName("");
      }
    } catch (err) {
      setReferralValid(false);
      setReferrerName("");
    } finally {
      setReferralValidating(false);
    }
  };

  const isFormValid = 
    form.name.length >= 2 && 
    /\S+@\S+\.\S+/.test(form.email) && 
    /^\d{10}$/.test(form.phone) && 
    form.password.length >= 6 &&
    !Object.values(errors).some(err => err !== "");

 useEffect(() => {
  if (show) {
    setStep("form");
    setErrors({});
    setOtp("");
    
    // ✅ Check for pending referral code from URL
    const pendingCode = localStorage.getItem("pendingReferralCode");
    
    if (pendingCode) {
      // Set form with the referral code
      setForm({ 
        name: "", 
        email: "", 
        phone: "", 
        password: "", 
        referralCode: pendingCode 
      });
      
      // Validate it
      validateReferralCode(pendingCode);
      
      // Clear from localStorage
      localStorage.removeItem("pendingReferralCode");
      
      // ✅ DON'T reset validation state here!
      // The validateReferralCode function will set it
    } else {
      // No pending code - reset everything
      setForm({ 
        name: "", 
        email: "", 
        phone: "", 
        password: "", 
        referralCode: "" 
      });
      setReferralValid(null);
      setReferrerName("");
    }
  }
}, [show]);

  const handleSignup = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      setStep("otp");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "";
      if (errorMessage.toLowerCase().includes("verified")) {
        if (confirm("Account exists and is verified. Login instead?")) {
          onClose();
          openLogin();
        }
      } else {
        alert(errorMessage || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/signup/verify-otp", {
        phone: form.phone,
        otp,
      });
      await loginWithToken(res.data.token);
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-genz-ink/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-[850px] min-h-[550px] rounded-genz shadow-2xl flex relative overflow-hidden animate-in zoom-in-95 duration-300 z-[1000]">
        <div className="hidden md:flex flex-col w-[35%] bg-genz-ink p-10 text-white justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Sign Up</h2>
            <p className="text-lg font-medium opacity-70 leading-tight">
              We're excited to have you join our community!
            </p>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-genz-accent rounded-full blur-3xl opacity-20" />
          <div className="relative z-10 flex justify-center">
             <img src="/authillustration.png" alt="Branding" className="w-52 object-contain" />
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col bg-white overflow-y-auto">
          <button onClick={onClose} className="self-end text-genz-muted hover:text-genz-ink transition-colors mb-4">
            <HiXMark size={28} />
          </button>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            {step === "form" && (
              <div className="space-y-5">
                <div className="space-y-1 mb-2">
                  <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.3em]">Fresh Start</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-genz-ink">Create Account</h2>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(v: any) => { setForm({ ...form, name: v }); validate("name", v); }}
                    />
                    {errors.name && <p className="text-[9px] text-red-500 font-bold absolute -bottom-4">{errors.name}</p>}
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Email Address"
                      type="email"
                      value={form.email}
                      onChange={(v: any) => { setForm({ ...form, email: v.toLowerCase() }); validate("email", v); }}
                    />
                    {errors.email && <p className="text-[9px] text-red-500 font-bold absolute -bottom-4">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Phone (10 digit)"
                      value={form.phone}
                      onChange={(v: any) => { setForm({ ...form, phone: v }); validate("phone", v); }}
                    />
                    {errors.phone && <p className="text-[9px] text-red-500 font-bold absolute -bottom-4">{errors.phone}</p>}
                  </div>

                  <div className="relative">
                    <Input
                      placeholder="Password"
                      type="password"
                      value={form.password}
                      onChange={(v: any) => { setForm({ ...form, password: v }); validate("password", v); }}
                    />
                    {errors.password && <p className="text-[9px] text-red-500 font-bold absolute -bottom-4">{errors.password}</p>}
                  </div>

                  {/* ✅ REFERRAL CODE INPUT */}
                  <div className="relative pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift size={14} className="text-genz-accent" />
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                        Have a Referral Code? (Optional)
                      </label>
                    </div>
                    
                    <div className="relative">
                      <Input
                        placeholder="Enter referral code"
                        value={form.referralCode}
                        onChange={(v: any) => {
                          const code = v.toUpperCase();
                          setForm({ ...form, referralCode: code });
                          
                          // Validate after 1 second of no typing
                          const timer = setTimeout(() => {
                            validateReferralCode(code);
                          }, 1000);
                          
                          return () => clearTimeout(timer);
                        }}
                      />
                
                      {/* Validation Icons */}
                      {form.referralCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {referralValidating ? (
                            <div className="w-4 h-4 border-2 border-genz-accent border-t-transparent rounded-full animate-spin" />
                          ) : referralValid === true ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : referralValid === false ? (
                            <XCircle size={16} className="text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Referral Feedback */}
                    {referralValid === true && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                        <p className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                          <CheckCircle size={12} />
                          Valid code! You were referred by <span className="text-green-800">{referrerName}</span>
                        </p>
                      </div>
                    )}
                    
                    {referralValid === false && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-[10px] text-red-700 font-bold flex items-center gap-1">
                          <XCircle size={12} />
                          Invalid referral code
                        </p>
                      </div>
                    )}

                    {!form.referralCode && (
                      <p className="text-[9px] text-gray-500 font-medium mt-1">
                        Get rewards when your friend uses your referral code!
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <PrimaryButton 
                    className={`w-full !text-white py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all 
                      ${isFormValid ? "!bg-genz-accent shadow-xl shadow-orange-500/20 active:scale-[0.95]" : "!bg-gray-300 cursor-not-allowed opacity-70"}`}
                    loading={loading} 
                    onClick={handleSignup}
                    disabled={!isFormValid || loading}
                  >
                    {isFormValid ? "REGISTER & SEND OTP" : "ENTER VALID DETAILS"}
                  </PrimaryButton>
                </div>

                <div className="text-center pt-4 border-t border-genz-border">
                  <button
                    onClick={() => { onClose(); openLogin(); }}
                    className="text-genz-accent font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Already part of the squad? Login
                  </button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.3em]">Security</p>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-genz-ink">Verify Phone</h2>
                  <p className="text-xs font-bold text-genz-muted uppercase tracking-tight">
                    Code sent to <span className="text-genz-ink">{form.phone}</span>
                  </p>
                  
                  {/* ✅ Show referral bonus message if code was used */}
                  {referralValid && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700 font-bold flex items-center justify-center gap-1">
                        <Gift size={14} />
                        {referrerName} will get rewards after you verify!
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    placeholder="Enter 6-digit OTP"
                    type="number"
                    value={otp}
                    onChange={setOtp}
                  />
                </div>

                <div className="space-y-3">
                  <PrimaryButton 
                    loading={loading} 
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || loading}
                    className={`w-full !text-white py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all 
                      ${otp.length === 6 ? "!bg-genz-accent shadow-xl shadow-orange-500/20" : "!bg-gray-300 opacity-70"}`}
                  >
                    {otp.length === 6 ? "VERIFY & JOIN" : "ENTER 6-DIGIT OTP"}
                  </PrimaryButton>

                  <button
                    onClick={() => setStep("form")}
                    className="w-full text-genz-accent font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    Wrong details? Go back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
