"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { HiXMark } from "react-icons/hi2";
import { Input, PrimaryButton } from "@/components/Home/AuthComponents";
import { useAuthModal } from "@/app/auth/AuthModalContext";

export default function AuthModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const { openRegister } = useAuthModal();

  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"identifier" | "password" | "otp">("identifier");

  useEffect(() => {
    if (show) {
      setStep("identifier");
      setIdentifier("");
      setPassword("");
      setOtp("");
    }
  }, [show]);

  const handleIdentifierSubmit = async () => {
    if (!identifier) return;
    setLoading(true);
    try {
      // Logic: Email contains @, otherwise assume Mobile
      if (identifier.includes("@")) {
        setStep("password");
      } else {
        await api.post("/auth/login/otp/send", { phone: identifier });
        setStep("otp");
      }
    } catch (err) {
      alert("Something went wrong. Please check your entry.");
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
      onClose();
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-genz-ink/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-[750px] h-[520px] rounded-genz shadow-2xl flex relative overflow-hidden animate-in zoom-in-95 duration-300 z-[1000]">
        
        {/* LEFT PANEL: The "Vibe" Panel */}
        <div className="hidden md:flex flex-col w-[40%] bg-genz-ink p-10 text-white justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Login</h2>
            <p className="text-lg font-medium opacity-70 leading-tight">
              Get access to your Orders, Recommendations and more.
            </p>
          </div>
          
          {/* Abstract Design Element */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-genz-accent rounded-full blur-3xl opacity-20" />
          
          <div className="relative z-10 flex justify-center">
             <img src="/authillustration.png" alt="Illustration" className="w-52 object-contain" />
          </div>
        </div>

        {/* RIGHT PANEL: The Action Panel */}
        <div className="flex-1 p-10 flex flex-col bg-white">
          <button onClick={onClose} className="self-end text-genz-muted hover:text-genz-ink transition-colors">
            <HiXMark size={28} />
          </button>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            {step === "identifier" && (
              <div className="space-y-8">
                <div className="relative group">
                   <input 
                     type="text"
                     autoFocus
                     value={identifier}
                     onChange={(e) => setIdentifier(e.target.value)}
                     className="w-full py-3 border-b-2 border-genz-border outline-none text-lg font-bold text-genz-ink focus:border-genz-accent transition-all peer placeholder-transparent"
                     placeholder="Email/Mobile"
                     id="identifier"
                   />
                   <label 
                     htmlFor="identifier" 
                     className="absolute left-0 -top-4 text-genz-muted text-[10px] font-black uppercase tracking-widest transition-all 
                                peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:font-medium
                                peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-genz-accent peer-focus:font-black"
                   >
                     Enter Email / Mobile
                   </label>
                </div>

                <p className="text-[10px] text-genz-muted leading-relaxed font-bold uppercase tracking-tight">
                  By continuing, you agree to our <span className="text-genz-accent cursor-pointer">Terms</span> and <span className="text-genz-accent cursor-pointer">Privacy Policy</span>.
                </p>

                <button 
                  onClick={handleIdentifierSubmit}
                  disabled={loading || identifier.length < 3}
                  className="w-full bg-genz-accent text-white py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-[0.95] disabled:bg-genz-border disabled:text-genz-muted"
                >
                  {loading ? "Processing..." : identifier.includes("@") ? "CONTINUE" : "PROCEED TO OTP"}
                </button>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-genz-accent uppercase tracking-widest">Security Check</p>
                  <h3 className="text-xl font-black text-genz-ink tracking-tight uppercase">Password for {identifier.split('@')[0]}</h3>
                </div>
                <Input 
                  placeholder="Your Password" 
                  type="password" 
                  value={password} 
                  onChange={setPassword} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>SECURE LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-[10px] font-black text-genz-muted hover:text-genz-accent uppercase tracking-widest">Back to Start</button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500 text-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-genz-accent uppercase tracking-widest">Verify Identity</p>
                  <h3 className="text-xl font-black text-genz-ink tracking-tight uppercase">Enter OTP sent to {identifier}</h3>
                </div>
                <Input 
                  placeholder="000000" 
                  type="number" 
                  value={otp} 
                  onChange={setOtp} 
                />
                <PrimaryButton loading={loading} onClick={handleFinalLogin}>VERIFY & LOGIN</PrimaryButton>
                <button onClick={() => setStep("identifier")} className="text-[10px] font-black text-genz-muted hover:text-genz-accent uppercase tracking-widest">Wrong Number?</button>
              </div>
            )}
          </div>

          <div className="mt-8 text-center border-t border-genz-border pt-6">
            <button 
              onClick={() => { onClose(); openRegister(); }}
              className="text-genz-accent font-black text-[10px] uppercase tracking-widest hover:underline"
            >
              New to the platform? Join now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
