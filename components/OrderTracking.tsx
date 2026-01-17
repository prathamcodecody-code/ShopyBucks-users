export default function OrderTracking({ status }: { status: string }) {
  const STEPS = [
    "PENDING",
    "ACCEPTED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
  ];

  const isCancelled = status === "CANCELLED";
  const isReturned = status === "RETURNED";

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex gap-6 mt-4 items-center">
      {STEPS.map((step, index) => {
        const isCompleted =
          currentIndex >= index &&
          !isCancelled &&
          !isReturned;

        return (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full ${
                isCompleted
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <p className="text-xs mt-1 text-center">
              {step}
            </p>
          </div>
        );
      })}

      {/* TERMINAL STATES */}
      {(isCancelled || isReturned) && (
        <div className="flex flex-col items-center">
          <div
            className={`w-6 h-6 rounded-full ${
              isCancelled ? "bg-red-500" : "bg-orange-500"
            }`}
          />
          <p className="text-xs mt-1 text-center">
            {status}
          </p>
        </div>
      )}
    </div>
  );
}
