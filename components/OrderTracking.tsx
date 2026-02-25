"use client";

import { 
  HiOutlineCheck, 
  HiOutlineXMark, 
  HiOutlineArrowPath 
} from "react-icons/hi2";

export default function OrderTracking({ status }: { status: string }) {
  const STEPS = ["PENDING", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"];

  const isCancelled = status === "CANCELLED";
  const isReturned = status === "RETURNED";
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto px-4">
        
        {/* PROGRESS LINE BACKGROUND */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-genz-border -z-10" />

        {STEPS.map((step, index) => {
          const isCompleted = !isCancelled && !isReturned && currentIndex >= index;
          const isCurrent = !isCancelled && !isReturned && currentIndex === index;

          return (
            <div key={step} className="flex flex-col items-center relative">
              {/* STEP CIRCLE */}
              <div
                className={`w-10 h-10 rounded-genz flex items-center justify-center border-2 transition-all duration-500 bg-genz-bg ${
                  isCompleted
                    ? "border-genz-accent bg-genz-accent text-white shadow-lg shadow-genz-softAccent"
                    : isCurrent
                    ? "border-genz-accent bg-white text-genz-accent scale-110 shadow-xl z-10"
                    : "border-genz-border bg-white text-genz-muted"
                }`}
              >
                {isCompleted ? (
                  <HiOutlineCheck size={20} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>

              {/* STEP LABEL */}
              <p className={`text-[11px] mt-3 font-bold tracking-tight ${
                isCompleted || isCurrent ? "text-genz-ink" : "text-genz-muted"
              }`}>
                {step}
              </p>
            </div>
          );
        })}

        {/* TERMINAL STATES (Cancelled / Returned) */}
        {(isCancelled || isReturned) && (
          <div className="flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-genz flex items-center justify-center border-2 shadow-lg ${
                isCancelled 
                  ? "bg-red-600 border-red-600 text-white shadow-red-100" 
                  : "bg-genz-accent border-genz-accent text-white shadow-genz-softAccent"
              }`}
            >
              {isCancelled ? <HiOutlineXMark size={20} /> : <HiOutlineArrowPath size={20} />}
            </div>
            <p className={`text-[11px] mt-3 font-bold tracking-tight ${
              isCancelled ? "text-red-600" : "text-genz-accent"
            }`}>
              {status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
