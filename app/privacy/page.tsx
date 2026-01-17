export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-700">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        FirstLady is committed to protecting your privacy. This policy explains how we collect, use,
        and safeguard your personal information.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Name, phone number, email address</li>
        <li>Shipping address</li>
        <li>Payment details</li>
        <li>Browsing and device information</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">2. How We Use Your Data</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To process and deliver orders</li>
        <li>To send updates, offers, and support</li>
        <li>To improve our website and shopping experience</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6">3. Data Security</h2>
      <p className="mb-4">
        We use secure servers and encryption to protect your personal information from unauthorized access.
      </p>

      <h2 className="text-xl font-semibold mt-6">4. Third-Party Sharing</h2>
      <p className="mb-4">
        Your data is shared only with trusted partners such as payment gateways and delivery services.
        We do not sell your personal information.
      </p>
    </div>
  );
}
