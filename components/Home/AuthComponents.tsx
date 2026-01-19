import { HiOutlineArrowLeft } from "react-icons/hi2";

export function Input({ placeholder, value, onChange, type = "text" }: any) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full border-b-2 border-gray-200 py-3 outline-none focus:border-[#2874f0] transition-colors text-lg font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function PrimaryButton({ children, onClick, loading }: any) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-white py-4 font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
export function SecondaryButton({ children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full border-2 border-gray-100 hover:border-amazon-orange/30 hover:bg-amazon-orange/5 py-4 rounded-2xl font-bold text-gray-700 transition-all active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export function BackButton({ onClick }: any) {
  return (
    <button onClick={onClick} className="text-xs font-black uppercase tracking-widest text-amazon-mutedText flex items-center gap-2 hover:text-amazon-orange transition-colors">
      <HiOutlineArrowLeft size={14} /> Back
    </button>
  );
}

export function OtpStep({ phone, otp, setOtp, loading, onVerify, onBack }: any) {
  return (
    <div className="space-y-5">
      <BackButton onClick={onBack} />
      <div className="space-y-1">
        <h3 className="text-xl font-black">Verify OTP</h3>
        <p className="text-sm text-gray-500 font-medium">Code sent to <span className="text-amazon-darkBlue font-bold">{phone}</span></p>
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
