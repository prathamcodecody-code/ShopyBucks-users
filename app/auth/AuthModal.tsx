"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { HiXMark } from "react-icons/hi2";
import { Input, PrimaryButton } from "@/components/Home/AuthComponents";

export default function AuthModal({ show: initialShow, onClose }: { show: boolean; onClose: () => void }) {
  const { loginWithToken } = useAuth();
  const [isVisible, setIsVisible] = useState(initialShow);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [identifier, setIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "password" | "otp">("identifier");

  useEffect(() => {
    const openModal = () => {
      setIsVisible(true);
      setStep("identifier");
    };
    window.addEventListener("open-auth-modal", openModal);
    return () => window.removeEventListener("open-auth-modal", openModal);
  }, []);

  useEffect(() => { setIsVisible(initialShow); }, [initialShow]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleIdentifierSubmit = async () => {
    setLoading(true);
    try {
      // Basic Logic: If it contains '@' it's an email (password flow), else phone (OTP flow)
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
      handleClose();
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-[750px] h-[520px] rounded-sm shadow-2xl flex relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* LEFT PANEL: Branding (Flipkart Style) */}
        <div className="hidden md:flex flex-col w-[40%] bg-[#2874f0] p-10 text-white justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Login</h2>
            <p className="text-lg opacity-80 leading-relaxed">
              Get access to your Orders, Recommendations and more
            </p>
          </div>
          <div className="flex justify-center opacity-40">
             <img src="/auth-illustration.png" alt="Login Illustration" className="w-40" />
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="flex-1 p-10 flex flex-col justify-between">
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
            <HiXMark size={24} />
          </button>

          <div className="space-y-6 mt-4">
            {step === "identifier" && (
              <div className="space-y-8">
                <div className="relative border-b-2 border-gray-200 focus-within:border-[#2874f0] transition-colors">
                   <input 
                     type="text"
                     value={identifier}
                     onChange={(e) => setIdentifier(e.target.value)}
                     className="w-full py-2 outline-none text-lg peer placeholder-transparent"
                     placeholder="Enter Email/Mobile number"
                     id="identifier"
                   />
                   <label htmlFor="identifier" className="absolute left-0 -top-5 text-gray-400 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-2 peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[#2874f0]">
                     Enter Email/Mobile number
                   </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  By continuing, you agree to ShopyBucks's <span className="text-[#2874f0]">Terms of Use</span> and <span className="text-[#2874f0]">Privacy Policy</span>.
                </p>
                <button 
                  onClick={handleIdentifierSubmit}
                  disabled={loading || identifier.length < 3}
                  className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-white py-4 font-bold shadow-md transition-all active:scale-[0.98] disabled:bg-gray-300"
                >
                  {loading ? "Processing..." : identifier.includes("@") ? "CONTINUE" : "REQUEST OTP"}
                </button>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-medium text-gray-600">Password for {identifier}</p>
                <Input 
                  placeholder="Enter Password" 
                  type="password" 
                  value={password} 
                  onChange={setPassword} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-xs font-bold text-[#2874f0]">Change Email?</button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-medium text-gray-600">Enter OTP sent to {identifier}</p>
                <Input 
                  placeholder="Enter 6-digit OTP" 
                  type="number" 
                  value={otp} 
                  onChange={setOtp} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>VERIFY & LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-xs font-bold text-[#2874f0]">Change Phone Number?</button>
              </div>
            )}
          </div>

          <div className="text-center">
            <button className="text-[#2874f0] font-bold text-sm hover:underline">
               New to ShopyBucks? Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
