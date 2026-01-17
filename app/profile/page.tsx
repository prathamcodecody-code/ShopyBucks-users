"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AuthModal from "../auth/AuthModal";
import { User, Package, LogOut, Edit2, ShieldCheck, Mail, Phone } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "orders">("account");

  if (!user) {
    return (
      <div className="py-20 text-center bg-amazon-lightGray min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-amazon-borderGray shadow-sm max-w-sm">
          <p className="text-xl font-bold text-amazon-text mb-2">Your Account</p>
          <p className="text-amazon-mutedText mb-6">Sign in to view your profile and manage orders.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text font-medium py-2 rounded shadow-sm transition-colors"
          >
            Sign In
          </button>
        </div>
        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="bg-amazon-lightGray min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR */}
        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-amazon-borderGray shadow-sm overflow-hidden">
            <div className="p-4 border-b border-amazon-borderGray bg-gray-50">
              <p className="font-bold text-amazon-text">Settings</p>
            </div>
            <div className="p-2 space-y-1">
              <SidebarBtn
                active={activeTab === "account"}
                onClick={() => setActiveTab("account")}
                icon={<User size={18} />}
              >
                Account Details
              </SidebarBtn>

              <SidebarBtn
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
                icon={<Package size={18} />}
              >
                My Orders
              </SidebarBtn>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-amazon-danger hover:bg-red-50 font-medium transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        {/* CONTENT */}
        <section className="md:col-span-3 space-y-6">
          {activeTab === "account" && (
            <AccountDetails user={user} setUser={setUser} />
          )}
          {activeTab === "orders" && <OrdersShortcut />}
        </section>
      </div>
    </div>
  );
}

/* ---------------- ACCOUNT DETAILS (EDITABLE) ---------------- */

function AccountDetails({ user, setUser }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
  });
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    try {
      setLoading(true);
      const res = await api.patch("/users/profile", form);
      setUser(res.data.user);
      setEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-amazon-borderGray shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-amazon-borderGray">
        <h2 className="text-xl font-bold text-amazon-text flex items-center gap-2">
          <ShieldCheck className="text-amazon-success" size={24} />
          Login & Security
        </h2>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 border border-amazon-borderGray px-4 py-1.5 rounded-md hover:bg-amazon-lightGray text-sm font-medium transition-colors"
          >
            <Edit2 size={14} />
            Edit
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-8 max-w-2xl">
          <ProfileField
            label="Name"
            value={form.name}
            editing={editing}
            icon={<User size={20} className="text-amazon-mutedText" />}
            onChange={(v: string) => setForm({ ...form, name: v })}
            placeholder="What is your name?"
          />

          <ProfileField
            label="Email"
            value={form.email}
            editing={editing}
            icon={<Mail size={20} className="text-amazon-mutedText" />}
            onChange={(v: string) => setForm({ ...form, email: v })}
            placeholder="Enter email address"
          />

          <div className="flex items-start gap-4">
            <div className="mt-1"><Phone size={20} className="text-amazon-mutedText" /></div>
            <StaticField label="Primary Phone Number" value={user.phone} />
          </div>
        </div>

        {editing && (
          <div className="mt-10 flex gap-3 pt-6 border-t border-amazon-borderGray">
            <button
              onClick={saveProfile}
              disabled={loading}
              className="bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-text px-8 py-2 rounded-md font-medium shadow-sm border border-amazon-orangeHover transition-colors"
            >
              {loading ? "Saving Changes..." : "Done"}
            </button>

            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 rounded-md border border-amazon-borderGray hover:bg-amazon-lightGray font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- REUSABLE FIELDS ---------------- */

function ProfileField({ label, value, editing, onChange, placeholder, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amazon-text">{label}</p>
        {editing ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-2 w-full max-w-sm border border-amazon-borderGray rounded px-3 py-2 focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange outline-none shadow-inner"
          />
        ) : (
          <p className="text-amazon-mutedText mt-0.5">
            {value || <span className="italic">Not provided</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function StaticField({ label, value }: any) {
  return (
    <div>
      <p className="text-sm font-bold text-amazon-text">{label}</p>
      <p className="text-amazon-mutedText mt-0.5">{value || "-"}</p>
    </div>
  );
}

function SidebarBtn({ active, children, icon, ...props }: any) {
  return (
    <button
      {...props}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-amazon-lightGray text-amazon-text border-l-4 border-amazon-orange"
          : "text-amazon-mutedText hover:bg-amazon-lightGray/50 border-l-4 border-transparent"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- ORDERS SHORTCUT ---------------- */

function OrdersShortcut() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg border border-amazon-borderGray shadow-sm overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold text-amazon-text mb-2">Your Orders</h2>
        <p className="text-amazon-mutedText mb-8">
          Track, return, or buy things again.
        </p>

        <div 
           onClick={() => router.push("/orders")}
           className="group border border-amazon-borderGray rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amazon-orangeHover transition-all bg-gray-50/50"
        >
          <div className="w-16 h-16 bg-white border border-amazon-borderGray rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
            <Package size={32} className="text-amazon-orange" />
          </div>
          <p className="font-bold text-amazon-text">View Order History</p>
          <p className="text-sm text-amazon-mutedText">Check status of your recent purchases</p>
        </div>
      </div>
    </div>
  );

}
