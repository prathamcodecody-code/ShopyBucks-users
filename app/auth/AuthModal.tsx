"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { HiXMark } from "react-icons/hi2";
import { Input, PrimaryButton } from "@/components/Home/AuthComponents";

export default function AuthModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "password" | "otp">("identifier");

  // Reset steps when modal opens/closes
  useEffect(() => {
    if (show) {
      setStep("identifier");
      setIdentifier("");
      setPassword("");
      setOtp("");
    }
  }, [show]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleIdentifierSubmit = async () => {
    setLoading(true);
    try {
      if (identifier.includes("@")) {
        setStep("password");
      } else {
        await api.post("/auth/login/otp/send", { phone: identifier });
        setStep("otp");
      }
    } catch (err) {
      alert("Invalid identifier or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalLogin = async () => {
    setLoading(true);
    try {
      let res;
      if (step === "password") {
        res = await api.post("/auth/login/password", { email: identifier, password });
      } else {
        res = await api.post("/auth/login/otp/verify", { phone: identifier, otp });
      }
      loginWithToken(res.data.token);
      onClose(); // Call parent onClose immediately
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-[750px] h-[520px] rounded-sm shadow-2xl flex relative overflow-hidden animate-in zoom-in-95 duration-300 z-[1000]">
        
        {/* LEFT PANEL: Branding (Updated to Orange) */}
        <div className="hidden md:flex flex-col w-[40%] bg-amazon-orange p-10 text-amazon-darkBlue justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl font-black">Login</h2>
            <p className="text-lg font-bold opacity-90 leading-relaxed">
              Get access to your Orders, Recommendations and more
            </p>
          </div>
          <div className="flex justify-center">
             {/* Removed opacity-40 to fix the fade issue */}
             <img src="/authillustration.png" alt="Login Illustration" className="w-48 object-contain" />
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="flex-1 p-10 flex flex-col justify-between bg-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-amazon-darkBlue transition-colors">
            <HiXMark size={28} />
          </button>

          <div className="space-y-6 mt-4">
            {step === "identifier" && (
              <div className="space-y-8">
                <div className="relative border-b-2 border-gray-200 focus-within:border-amazon-orange transition-colors">
                   <input 
                     type="text"
                     autoFocus
                     value={identifier}
                     onChange={(e) => setIdentifier(e.target.value)}
                     className="w-full py-2 outline-none text-lg peer placeholder-transparent"
                     placeholder="Enter Email/Mobile number"
                     id="identifier"
                   />
                   <label htmlFor="identifier" className="absolute left-0 -top-5 text-gray-400 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-amazon-orange">
                     Enter Email/Mobile number
                   </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  By continuing, you agree to ShopyBucks's <span className="text-amazon-orange font-bold cursor-pointer">Terms of Use</span> and <span className="text-amazon-orange font-bold cursor-pointer">Privacy Policy</span>.
                </p>
                <button 
                  onClick={handleIdentifierSubmit}
                  disabled={loading || identifier.length < 3}
                  className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 font-black shadow-lg transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {loading ? "Processing..." : identifier.includes("@") ? "CONTINUE" : "REQUEST OTP"}
                </button>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-tighter">Password for {identifier}</p>
                <Input 
                  placeholder="Enter Password" 
                  type="password" 
                  value={password} 
                  onChange={setPassword} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-xs font-black text-amazon-orange uppercase tracking-tighter">Change Email?</button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-tighter text-center">OTP sent to {identifier}</p>
                <Input 
                  placeholder="Enter 6-digit OTP" 
                  type="number" 
                  value={otp} 
                  onChange={setOtp} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>VERIFY & LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-xs font-black text-amazon-orange uppercase tracking-tighter">Change Phone Number?</button>
              </div>
            )}
          </div>

          <div className="text-center pt-4">
            <button className="text-amazon-orange font-black text-xs uppercase tracking-widest hover:underline">
               New to ShopyBucks? Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
