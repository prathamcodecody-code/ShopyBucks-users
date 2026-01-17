"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Delivery usually takes 4–7 business days depending on your location.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for unused products with original tags.",
  },
  {
    q: "How can I track my order?",
    a: "Tracking details will be sent to your email and WhatsApp once the order is shipped.",
  },
  {
    q: "Do you offer cash on delivery?",
    a: "Yes, COD is available on selected locations across India.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can email us at support@firstlady.com or message us on WhatsApp.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<null | number>(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-700">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>

      <div className="space-y-4">
        {faqs.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex justify-between items-center text-left"
            >
              <span className="font-semibold text-lg">{item.q}</span>

              <span className="text-brandPink text-xl">
                {openIndex === index ? "-" : "+"}
              </span>
            </button>

            {openIndex === index && (
              <p className="text-gray-600 mt-3">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
