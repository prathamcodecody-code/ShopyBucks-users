"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="bg-white shadow-md border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

        {success && (
          <p className="mb-4 text-green-600 font-semibold">
            Message sent successfully!
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            className="border p-3 rounded-md"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-3 rounded-md"
            placeholder="Your Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="border p-3 rounded-md"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="border p-3 rounded-md"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <textarea
            className="border p-3 rounded-md md:col-span-2"
            rows={5}
            placeholder="Your Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button
            onClick={submit}
            disabled={loading}
            className="bg-brandPink text-white py-3 rounded-md font-semibold md:col-span-2 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
