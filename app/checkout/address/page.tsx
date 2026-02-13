"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCheckout } from "@/app/context/CheckoutContext";
import { HiOutlineMapPin, HiOutlineShieldCheck, HiPlus, HiCheck } from "react-icons/hi2";
import toast from "react-hot-toast";

/* ================= STEPPER COMPONENT ================= */
const steps = [
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

function CheckoutStepper({ currentStep }: { currentStep: string }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => {
        const isCompleted = steps.findIndex(s => s.id === currentStep) > idx;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? "border-genz-accent bg-genz-accent text-white shadow-lg shadow-genz-accent/30" 
                    : isCompleted 
                    ? "border-genz-ink bg-genz-ink text-white" 
                    : "border-genz-border bg-white text-genz-muted"
                }`}
              >
                {isCompleted ? <HiCheck size={20} /> : <span className="font-black text-sm">{idx + 1}</span>}
              </div>
              <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                isActive ? "text-genz-ink" : "text-genz-muted"
              }`}>
                {step.label}
              </span>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`w-16 md:w-24 h-[2px] mx-2 ${isCompleted ? "bg-genz-ink" : "bg-genz-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { setAddressId, addressId: savedAddressId } = useCheckout();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(savedAddressId);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api
      .get("/user/addresses")
      .then((res) => {
        setAddresses(res.data || []);
        // If no saved address, select default
        if (!savedAddressId) {
          const def = res.data?.find((a: any) => a.isDefault);
          if (def) setSelectedId(def.id);
        }
      })
      .catch(() => toast.error("Failed to load addresses"))
      .finally(() => setLoading(false));
  }, [savedAddressId]);

  const continueToPayment = () => {
    if (!selectedId) {
      toast.error("Please select an address");
      return;
    }
    setAddressId(selectedId);
    router.push("/checkout/payment");
  };

  const handleAddressAdded = () => {
    setShowAdd(false);
    // Refresh addresses
    api.get("/user/addresses").then((res) => {
      setAddresses(res.data || []);
      // Select the newly added address if it exists
      const newAddr = res.data?.[res.data.length - 1];
      if (newAddr) {
        setSelectedId(newAddr.id);
      }
    });
  };

  return (
    <div className="bg-genz-bg min-h-screen py-12 px-4 text-genz-ink">
      <div className="max-w-2xl mx-auto">
        
        {/* NEW STEPPER FLOW */}
        <CheckoutStepper currentStep="address" />

        {/* HEADER */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Shipping</h1>
            <p className="text-genz-muted font-medium">Where should we send your order?</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <HiOutlineShieldCheck size={14} />
            Secure Encrypted
          </div>
        </div>

        {/* ADDRESS LIST */}
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-genz" />)}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 px-4 bg-genz-card border-2 border-dashed border-genz-border rounded-genz">
              <HiOutlineMapPin size={48} className="mx-auto text-genz-muted mb-4" />
              <p className="text-genz-muted font-bold mb-4">No addresses saved yet</p>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-genz-accent text-white px-6 py-3 rounded-genz font-bold hover:brightness-110 transition-all"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <>
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`relative block border-2 rounded-genz p-5 cursor-pointer transition-all duration-200 shadow-sm
                    ${selectedId === a.id 
                      ? "border-genz-accent bg-genz-softAccent ring-4 ring-genz-accent/5" 
                      : "border-genz-border bg-genz-card hover:border-genz-muted"
                    }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={selectedId === a.id}
                    onChange={() => setSelectedId(a.id)}
                  />

                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`mt-1 p-2 rounded-lg ${selectedId === a.id ? "bg-genz-accent text-white" : "bg-genz-bg text-genz-muted"}`}>
                        <HiOutlineMapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{a.fullName}</p>
                        <p className="text-sm font-medium opacity-80">{a.phone}</p>
                        <p className="text-sm mt-2 text-genz-muted leading-relaxed">
                          {a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}<br />
                          {a.city}, {a.state} – {a.pincode}
                        </p>
                      </div>
                    </div>
                    {a.isDefault && (
                      <span className="text-[10px] font-black uppercase tracking-tighter bg-genz-ink text-white px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}

              <button
                onClick={() => setShowAdd(true)}
                className="w-full border-2 border-dashed border-genz-border rounded-genz py-6 flex flex-col items-center gap-2 text-genz-muted hover:text-genz-accent hover:border-genz-accent transition-all bg-genz-card/50 hover:bg-genz-card"
              >
                <HiPlus size={24} />
                <span className="font-bold">Add New Address</span>
              </button>
            </>
          )}
        </div>

        {/* ACTION */}
        <div className="mt-10 pt-6 border-t border-genz-border">
          <button
            onClick={continueToPayment}
            disabled={!selectedId || loading}
            className="w-full bg-genz-accent hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white py-5 rounded-genz font-black text-xl transition-all shadow-lg shadow-genz-accent/20 active:scale-[0.98]"
          >
            Continue to Payment
          </button>
        </div>
      </div>

      {showAdd && (
        <AddAddressModal
          onClose={() => setShowAdd(false)}
          onAdded={handleAddressAdded}
        />
      )}
    </div>
  );
}

function AddAddressModal({ onClose, onAdded }: any) {
  const [form, setForm] = useState({
    fullName: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", pincode: "", isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    // Validation
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      await api.post("/user/addresses", form);
      toast.success("Address added!");
      onAdded();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-genz-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-genz-card rounded-genz p-8 w-full max-w-xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div>
          <h3 className="font-black text-2xl tracking-tight">New Address</h3>
          <p className="text-genz-muted text-sm">Fill in the details for your delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries({
            fullName: "Full Name",
            phone: "Phone Number",
            addressLine1: "Street Address",
            addressLine2: "Apt, Suite (Optional)",
            city: "City",
            state: "State",
            pincode: "Zip Code",
          }).map(([k, label]) => (
            <div key={k} className={k === 'addressLine1' || k === 'fullName' ? 'md:col-span-2' : ''}>
              <label className="text-[10px] font-black uppercase text-genz-muted ml-1 mb-1 block">{label}</label>
              <input
                placeholder={label}
                value={(form as any)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full border-2 border-genz-border rounded-xl px-4 py-3 focus:border-genz-accent outline-none transition-colors font-medium"
              />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-genz-border text-genz-accent focus:ring-genz-accent"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          <span className="text-sm font-bold text-genz-muted group-hover:text-genz-ink transition-colors">Set as default address</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose} 
            disabled={saving}
            className="flex-1 border-2 border-genz-border py-4 rounded-xl font-bold hover:bg-genz-bg transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-genz-ink text-white py-4 rounded-xl font-bold hover:bg-black transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
