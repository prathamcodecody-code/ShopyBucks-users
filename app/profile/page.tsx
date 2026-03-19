"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AuthModal from "../auth/AuthModal";
import { 
  User, Package, LogOut, Edit2, ShieldCheck, MapPin, ChevronRight, Plus, Wallet,
  Gift, Copy, Share2, Users, TrendingUp, Clock, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import WalletBalanceCard from "@/components/wallet/WalletBalanceCard";
import WalletTransactions from "@/components/wallet/WalletTransactions";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const isBlocked = user?.isBlocked;
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "orders" | "addresses" | "wallet" | "referral">("account");

  if (!user) {
    return (
      <div className="py-20 bg-genz-bg min-h-[80vh] flex items-center justify-center px-4">
        <div className="bg-genz-card p-10 rounded-genz border border-genz-border shadow-xl max-w-md text-center">
          <div className="w-20 h-20 bg-genz-softAccent rounded-full flex items-center justify-center mx-auto mb-6 text-genz-accent">
            <User size={40} />
          </div>
          <h1 className="text-3xl font-black text-genz-ink mb-3 tracking-tight">Your Profile</h1>
          <p className="text-genz-muted mb-8 font-medium">Join the club to track orders and manage your details.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full bg-genz-accent hover:brightness-110 text-white font-black py-4 rounded-xl shadow-lg shadow-genz-accent/20 transition-all active:scale-95"
          >
            Sign In / Register
          </button>
        </div>
        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="bg-genz-bg min-h-screen text-genz-ink">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter">My Account</h1>
          <p className="text-genz-muted font-medium">Manage your settings and order history</p>
        </header>

        {isBlocked && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
            <p className="font-bold text-sm">Your account has been blocked.</p>
            {user?.blockedReason && (
              <p className="text-sm mt-1">Reason: {user.blockedReason}</p>
            )}
            <p className="text-xs mt-2 text-red-600">
              You can view your account information but actions are disabled.
            </p>
            <p className="text-xs mt-2 text-red-600">
              You can contact our support team: support@shopybucks.com
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="space-y-3">
            <div className="bg-genz-card rounded-genz border border-genz-border p-2 shadow-sm">
              <SidebarBtn active={activeTab === "account"} onClick={() => !isBlocked && setActiveTab("account")} icon={<User size={20} />}>
                Account Details
              </SidebarBtn>
              <SidebarBtn active={activeTab === "orders"} onClick={() => !isBlocked && setActiveTab("orders")} icon={<Package size={20} />}>
                My Orders
              </SidebarBtn>
              <SidebarBtn active={activeTab === "wallet"} onClick={() => !isBlocked && setActiveTab("wallet")} icon={<Wallet size={20} />}>
                My Wallet
              </SidebarBtn>
              <SidebarBtn active={activeTab === "referral"} onClick={() => !isBlocked && setActiveTab("referral")} icon={<Gift size={20} />}>
                Refer & Earn
              </SidebarBtn>
              <SidebarBtn active={activeTab === "addresses"} onClick={() => !isBlocked && setActiveTab("addresses")} icon={<MapPin size={20} />}>
                Addresses
              </SidebarBtn>
            </div>

            <button
              onClick={() => { logout(); router.push("/"); }}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-genz text-red-500 hover:bg-red-50 font-bold transition-all border border-transparent active:scale-95"
            >
              <LogOut size={20} />
              Logout
            </button>
          </aside>

          {/* CONTENT SECTION */}
          <section className="md:col-span-3">
            {activeTab === "account" && <AccountDetails user={user} setUser={setUser} />}
            {activeTab === "orders" && !isBlocked && <OrdersShortcut />}
            {activeTab === "wallet" && !isBlocked && <WalletSection />}
            {activeTab === "referral" && !isBlocked && <ReferralSection user={user} />}
            {activeTab === "addresses" && !isBlocked && <AddressManager />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------------- REFERRAL SECTION ---------------- */

function ReferralSection({ user }: any) {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [statsRes, referralsRes] = await Promise.all([
        api.get("/referral/my-stats"),
        api.get("/referral/my-referrals"),
      ]);
      setStats(statsRes.data);
      setReferrals(referralsRes.data);
    } catch (err) {
      console.error("Failed to load referral data:", err);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied!");
  };

  const shareReferral = async () => {
    const text = `Join ShopyBucks using my referral code ${user.referralCode} and we both get rewards! 🎁`;
    const url = `${window.location.origin}/signup?ref=${user.referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Join ShopyBucks", text, url });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Referral link copied!");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-genz-card rounded-genz"></div>
        <div className="h-64 bg-genz-card rounded-genz"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* REFERRAL CODE CARD */}
      <div className="bg-gradient-to-br from-genz-accent/10 to-genz-accent/5 rounded-genz border-2 border-genz-accent/20 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-genz-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-genz-accent/20 rounded-xl text-genz-accent">
              <Gift size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Your Referral Code</h2>
              <p className="text-genz-muted font-medium text-sm">Share with friends and earn rewards</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-genz-border shadow-lg">
            <p className="text-xs font-black uppercase text-genz-muted mb-2 tracking-widest">Your Code</p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-3xl font-black tracking-tighter text-genz-accent font-mono">
                {user.referralCode}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyReferralCode}
                  className="p-3 bg-genz-bg hover:bg-genz-border rounded-xl transition-all active:scale-95"
                  title="Copy code"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={shareReferral}
                  className="p-3 bg-genz-accent text-white hover:brightness-110 rounded-xl transition-all active:scale-95"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-genz-softAccent/30 rounded-xl border border-genz-accent/20">
            <p className="text-sm font-bold text-genz-ink">
              💰 Earn ₹{stats?.rewardAmount || 5} for every friend who signs up and verifies their account!
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Users className="text-blue-600" size={24} />}
          label="Total Referrals"
          value={stats?.totalReferrals || 0}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" size={24} />}
          label="Completed"
          value={stats?.completedReferrals || 0}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<TrendingUp className="text-purple-600" size={24} />}
          label="Total Earned"
          value={`₹${stats?.totalEarned || 0}`}
          bgColor="bg-purple-50"
        />
      </div>

      {/* REFERRAL LIST */}
      <div className="bg-genz-card rounded-genz border border-genz-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-genz-border">
          <h3 className="text-xl font-black">Your Referrals</h3>
          <p className="text-sm text-genz-muted font-medium">Track your referral progress</p>
        </div>

        <div className="divide-y divide-genz-border">
          {referrals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-genz-softAccent rounded-full flex items-center justify-center mx-auto mb-4 text-genz-accent">
                <Users size={32} />
              </div>
              <p className="text-genz-muted font-bold">No referrals yet</p>
              <p className="text-sm text-genz-muted/60 font-medium mt-1">
                Share your code to start earning!
              </p>
            </div>
          ) : (
            referrals.map((referral) => (
              <div key={referral.id} className="p-6 hover:bg-genz-bg/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        referral.status === 'COMPLETED' 
                          ? 'bg-green-50 text-green-600'
                          : referral.status === 'PENDING'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {referral.status === 'COMPLETED' ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-genz-ink">
                          {referral.referredUser.name || referral.referredUser.email}
                        </p>
                        <p className="text-xs text-genz-muted font-medium">
                          {new Date(referral.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={referral.status} />
                    {referral.status === 'COMPLETED' && (
                      <p className="text-green-600 font-black text-sm mt-2">
                        +₹{referral.rewardAmount}
                      </p>
                    )}
                  </div>
                </div>

                {referral.status === 'PENDING' && !referral.referredUser.isVerified && (
                  <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs font-bold text-orange-600">
                      ⏳ Waiting for friend to verify their account
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-genz-card rounded-genz border border-genz-border p-6">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
          <Gift size={20} className="text-genz-accent" />
          How It Works
        </h3>
        <ol className="space-y-3">
          {[
            "Share your unique referral code with friends",
            "Your friend signs up using your code",
            "They verify their phone number",
            "You both get rewarded instantly!"
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-genz-accent text-white rounded-full flex items-center justify-center text-xs font-black">
                {i + 1}
              </div>
              <span className="text-sm font-medium text-genz-ink/80">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: any) {
  return (
    <div className="bg-genz-card rounded-genz border border-genz-border p-6 hover:border-genz-accent/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-xs font-black uppercase text-genz-muted tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-genz-ink tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    COMPLETED: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
      label: "Completed",
    },
    PENDING: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-200",
      label: "Pending",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200",
      label: "Rejected",
    },
  };

  const style = styles[status] || styles.PENDING;

  return (
    <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-tight rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

/* ---------------- ACCOUNT DETAILS ---------------- */

function AccountDetails({ user, setUser }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "" });
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return toast.error("Invalid email address");
    }

    try {
      setLoading(true);
      const res = await api.patch("/users/profile", form);
      setUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-genz-card rounded-genz border border-genz-border shadow-sm overflow-hidden">
      <div className="p-8 border-b border-genz-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-black">Security Settings</h2>
        </div>
        {!editing && (
          <button
            disabled={user?.isBlocked}
            onClick={() => {
              if (user?.isBlocked) return;
              setEditing(true);
            }}
            className="flex items-center gap-2 bg-genz-bg px-4 py-2 rounded-xl hover:bg-genz-border font-bold text-sm transition-all"
          >
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProfileField
            label="Full Name"
            value={form.name}
            editing={editing}
            onChange={(v: any) => setForm({ ...form, name: v })}
            placeholder="Your name"
          />
          <ProfileField
            label="Email Address"
            value={form.email}
            editing={editing}
            onChange={(v: any) => setForm({ ...form, email: v })}
            placeholder="Email"
            type="email"
          />
          <div className="opacity-60">
            <p className="text-[10px] font-black uppercase text-genz-muted mb-2 tracking-widest">Phone Number</p>
            <p className="font-bold text-lg flex items-center gap-2">
              {user.phone} <span className="text-[10px] bg-genz-bg px-2 py-0.5 rounded-full">Locked</span>
            </p>
          </div>
        </div>

        {editing && (
          <div className="pt-6 border-t border-genz-border flex gap-4">
            <button
              onClick={saveProfile}
              disabled={loading}
              className="bg-genz-ink text-white px-8 py-3 rounded-xl font-black disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => { setForm({ name: user.name, email: user.email }); setEditing(false); }}
              className="px-8 py-3 rounded-xl font-bold bg-genz-bg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- WALLET SECTION ---------------- */

function WalletSection() {
  return (
    <div className="space-y-6">
      <WalletBalanceCard />
      <WalletTransactions />
    </div>
  );
}

/* ---------------- SHARED COMPONENTS ---------------- */

function ProfileField({ label, value, editing, onChange, placeholder, type = "text" }: any) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-genz-muted mb-2 tracking-widest">{label}</p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-2 border-genz-border rounded-xl px-4 py-3 focus:border-genz-accent outline-none transition-all font-bold"
        />
      ) : (
        <p className="font-bold text-lg">{value || "Not set"}</p>
      )}
    </div>
  );
}

function SidebarBtn({ active, children, icon, ...props }: any) {
  return (
    <button
      {...props}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black transition-all mb-1 ${
        active
          ? "bg-genz-ink text-white shadow-md"
          : "text-genz-muted hover:bg-genz-bg"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {children}
      </div>
      <ChevronRight size={16} className={active ? "opacity-100" : "opacity-0"} />
    </button>
  );
}

function OrdersShortcut() {
  const router = useRouter();
  return (
    <div className="bg-genz-card rounded-genz border border-genz-border p-10 text-center shadow-sm">
      <div className="w-20 h-20 bg-genz-softAccent text-genz-accent rounded-full flex items-center justify-center mx-auto mb-6">
        <Package size={36} />
      </div>
      <h2 className="text-2xl font-black mb-2">Order History</h2>
      <p className="text-genz-muted font-medium mb-8">Check the status of your packages and past drops.</p>
      <button 
        onClick={() => router.push("/orders")}
        className="bg-genz-accent text-white px-10 py-4 rounded-xl font-black shadow-lg shadow-genz-accent/20 active:scale-95"
      >
        View All Orders
      </button>
    </div>
  );
}

function AddressManager() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/user/addresses");
      setAddresses(res.data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const deleteAddress = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    try {
      await api.delete(`/user/addresses/${id}`);
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const setDefault = async (id: number) => {
    try {
      await api.patch(`/user/addresses/${id}`, { isDefault: true });
      fetchAddresses();
    } catch {
      toast.error("Failed to set default");
    }
  };

  return (
    <div className="bg-genz-card rounded-genz border border-genz-border shadow-sm p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Saved Addresses</h2>
          <p className="text-genz-muted text-sm font-medium">Where we drop your gear</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-genz-ink text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-black transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-40 bg-genz-bg rounded-genz" />
          <div className="h-40 bg-genz-bg rounded-genz" />
        </div>
      ) : (
        <>
          {!loading && addresses.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-genz-border rounded-genz">
              <p className="text-genz-muted font-bold italic">No addresses saved yet.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`group border-2 rounded-genz p-6 relative transition-all ${
                  a.isDefault 
                    ? "border-genz-accent bg-genz-softAccent/30" 
                    : "border-genz-border bg-genz-card hover:border-genz-muted"
                }`}
              >
                {a.isDefault && (
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-tighter bg-genz-accent text-white px-2 py-1 rounded">
                    Default
                  </span>
                )}

                <p className="font-black text-lg">{a.fullName}</p>
                <p className="text-sm font-bold text-genz-muted mb-3">{a.phone}</p>
                
                <p className="text-sm text-genz-ink/80 leading-relaxed mb-6">
                  {a.addressLine1}
                  {a.addressLine2 && `, ${a.addressLine2}`}<br />
                  {a.city}, {a.state} – {a.pincode}
                </p>

                <div className="flex gap-4 pt-4 border-t border-genz-border">
                  <button
                    onClick={() => {
                      setEditing(a);
                      setShowForm(true);
                    }}
                    className="text-xs font-black uppercase tracking-widest text-genz-ink hover:text-genz-accent"
                  >
                    Edit
                  </button>

                  {!a.isDefault && (
                    <button
                      onClick={() => setDefault(a.id)}
                      className="text-xs font-black uppercase tracking-widest text-green-600 hover:text-green-700"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => deleteAddress(a.id)}
                    className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-700 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <AddressForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchAddresses();
          }}
        />
      )}
    </div>
  );
}

function AddressForm({ initial, onClose, onSaved }: any) {
  const [form, setForm] = useState(
    initial || {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    }
  );

  const save = async () => {
    try {
      if (initial) {
        await api.patch(`/user/addresses/${initial.id}`, form);
        toast.success("Address updated");
      } else {
        await api.post("/user/addresses", form);
        toast.success("Address added");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="fixed inset-0 bg-genz-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-genz-card rounded-genz p-8 w-full max-w-xl shadow-2xl space-y-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight">
            {initial ? "Update Address" : "New Address"}
          </h3>
          <p className="text-genz-muted text-sm font-medium">Double check those details!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["fullName", "Full Name", "md:col-span-2"],
            ["phone", "Phone", ""],
            ["pincode", "Pincode", ""],
            ["addressLine1", "Address Line 1", "md:col-span-2"],
            ["addressLine2", "Apt, Suite, etc.", "md:col-span-2"],
            ["city", "City", ""],
            ["state", "State", ""],
          ].map(([k, label, span]) => (
            <div key={k} className={span}>
              <label className="text-[10px] font-black uppercase text-genz-muted ml-1 mb-1 block">
                {label}
              </label>
              <input
                placeholder={label}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full border-2 border-genz-border rounded-xl px-4 py-3 focus:border-genz-accent outline-none transition-all font-bold"
              />
            </div>
          ))}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group py-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            className="w-5 h-5 rounded border-genz-border text-genz-accent focus:ring-genz-accent"
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          <span className="text-sm font-bold text-genz-muted group-hover:text-genz-ink transition-colors">
            Make this my default drop-off point
          </span>
        </label>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 border-2 border-genz-border rounded-xl font-black hover:bg-genz-bg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 bg-genz-accent text-white px-6 py-4 rounded-xl font-black shadow-lg shadow-genz-accent/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}
