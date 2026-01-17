export default function ReturnRefundPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-700">
      
      <h1 className="text-3xl font-bold mb-6">Return & Refund Policy</h1>

      <p className="text-gray-600 mb-8">
        At <span className="text-brandPink font-semibold">FirstLady</span>, we want you to love your purchase. 
        If for any reason you wish to return an item, we are here to help.  
      </p>

      {/* SECTION */}
      <div className="bg-white shadow-md border rounded-xl p-8 space-y-6">

        {/* 1. Return Window */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            1. Return Window
          </h2>
          <p className="text-gray-600">
            You can request a return within <strong>7 days</strong> of delivery.  
            To be eligible, the product must be unused, unwashed, and have all original tags intact.
          </p>
        </div>

        {/* 2. Items Not Eligible */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            2. Items Not Eligible for Return
          </h2>
          <ul className="list-disc ml-6 text-gray-600">
            <li>Innerwear, lingerie, and hygiene-sensitive items</li>
            <li>Items marked as "Final Sale" or "Non-returnable"</li>
            <li>Products damaged due to misuse or inappropriate washing</li>
          </ul>
        </div>

        {/* 3. Return Process */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            3. Return Process
          </h2>
          <ol className="list-decimal ml-6 text-gray-600 space-y-2">
            <li>Go to your Orders page.</li>
            <li>Select the item you want to return.</li>
            <li>Choose the reason and upload images if required.</li>
            <li>Our team will verify and arrange pickup within 2–4 days.</li>
          </ol>
        </div>

        {/* 4. Refund Methods */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            4. Refund Methods
          </h2>

          <p className="text-gray-600 mb-3">
            Once your return is approved and picked up, refund will be issued as:
          </p>

          <ul className="list-disc ml-6 text-gray-600">
            <li>Original Payment Method (UPI, Wallet, Card) – takes 3–7 business days</li>
            <li>Store Credit / FirstLady Wallet – instant once approved</li>
          </ul>
        </div>

        {/* 5. Exchange */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            5. Exchange Policy
          </h2>
          <p className="text-gray-600">
            We offer size and color exchanges depending on availability.  
            If the requested size is out of stock, the amount will be refunded.
          </p>
        </div>

        {/* 6. Contact */}
        <div>
          <h2 className="text-xl font-semibold text-brandPink mb-2">
            Need Help?
          </h2>
          <p className="text-gray-600">
            For support, contact us at  
            <span className="font-medium"> support@firstlady.com</span>  
            or WhatsApp us at <span className="font-medium">+91 98765 43210</span>.
          </p>
        </div>

      </div>
    </div>
  );
}
