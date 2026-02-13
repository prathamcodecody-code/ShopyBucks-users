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
