import { HiOutlineArrowLeft } from "react-icons/hi2";

export function Input({ placeholder, value, onChange, type = "text" }: any) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full border border-gray-200 bg-gray-50/50 p-4 rounded-2xl focus:bg-white focus:border-amazon-orange focus:ring-4 focus:ring-amazon-orange/10 outline-none transition-all font-medium placeholder:text-gray-400"
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
      className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-2xl font-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-100"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-amazon-darkBlue border-t-transparent rounded-full animate-spin" />
          <span>Please wait...</span>
        </div>
      ) : children}
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