import { HiOutlineArrowLeft } from "react-icons/hi2";

export function Input({ placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        /* Updated border and focus colors to match GenZ Tech theme */
        className="w-full border-b-2 border-genz-border py-3 outline-none focus:border-genz-accent transition-all text-lg font-bold text-genz-ink placeholder-genz-muted/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function PrimaryButton({ children, onClick, loading, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      /* 1. Replaced bg-amazon-orange with bg-genz-accent
         2. Changed rounded corners to rounded-full for the GenZ pill look
         3. Added tracking-widest and uppercase for the tech aesthetic
      */
      className={`w-full bg-genz-accent hover:bg-genz-accent/90 text-white py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-[0.96] disabled:opacity-50 disabled:bg-genz-border ${className}`}
    >
      {loading ? "PROCESSING..." : children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      /* Replaced amazon colors with genz-ink and soft borders */
      className="w-full border-2 border-genz-border hover:border-genz-ink hover:bg-genz-bg py-4 rounded-full font-black text-xs uppercase tracking-widest text-genz-ink transition-all active:scale-[0.96]"
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className="text-[10px] font-black uppercase tracking-widest text-genz-muted flex items-center gap-2 hover:text-genz-accent transition-colors"
    >
      <HiOutlineArrowLeft size={14} /> Back
    </button>
  );
}

export function OtpStep({ phone, otp, setOtp, loading, onVerify, onBack }: any) {
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <div className="space-y-1">
        <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.3em]">Security</p>
        <h3 className="text-2xl font-black uppercase tracking-tighter text-genz-ink">Verify OTP</h3>
        <p className="text-sm text-genz-muted font-medium">Code sent to <span className="text-genz-ink font-bold">{phone}</span></p>
      </div>
      <Input 
        placeholder="Enter 6-digit OTP" 
        value={otp} 
        onChange={setOtp} 
        type="number"
      />
      <PrimaryButton loading={loading} onClick={onVerify}>
        Verify & Continue
      </PrimaryButton>
    </div>
  );
}
