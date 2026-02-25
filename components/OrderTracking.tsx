"use client";

import { 
  HiOutlineCheck, 
  HiOutlineXMark, 
  HiOutlineArrowPath,
  HiTruck
} from "react-icons/hi2";

export default function OrderTracking({ status }: { status: string }) {
  const STEPS = ["PENDING", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"];

  const isCancelled = status === "CANCELLED";
  const isReturned = status === "RETURNED";
  const currentIndex = STEPS.indexOf(status);

  // Calculate truck and line position
  const progressPercent = currentIndex >= 0 
    ? (currentIndex / (STEPS.length - 1)) * 100 
    : 0;

  return (
    <div className="w-full py-12">
      <div className="relative max-w-4xl mx-auto px-10">
        
        {/* THE ROAD (Gray Background Line) */}
        <div className="absolute top-5 left-10 right-10 h-[3px] bg-genz-border -z-10 rounded-full" />

        {/* THE JOURNEY (Orange Progress Line) */}
        {!isCancelled && !isReturned && (
          <div 
            className="absolute top-5 left-10 h-[3px] bg-genz-accent -z-10 transition-all duration-1000 ease-in-out rounded-full"
            style={{ width: `calc(${progressPercent}%)` }}
          />
        )}

        {/* MOVING TRUCK OVERLAY */}
        {!isCancelled && !isReturned && currentIndex >= 0 && (
          <div 
            className="absolute top-[-22px] transition-all duration-1000 ease-in-out z-30"
            style={{ 
                left: `calc(${progressPercent}% + 40px)`, 
                transform: 'translateX(-100%)' 
            }}
          >
            <div className="flex flex-col items-center">
                <div className="bg-genz-accent text-white p-2 rounded-xl shadow-lg shadow-genz-softAccent animate-bounce">
                    <HiTruck size={22} />
                </div>
                {/* Pointer triangle */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-genz-accent" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = !isCancelled && !isReturned && currentIndex >= index;
            const isCurrent = !isCancelled && !isReturned && currentIndex === index;

            return (
              <div key={step} className="flex flex-col items-center relative">
                {/* STEP CIRCLE */}
                <div
                  className={`w-10 h-10 rounded-genz flex items-center justify-center border-2 transition-all duration-700 z-20 ${
                    isCompleted
                      ? "border-genz-accent bg-genz-accent text-white shadow-md shadow-genz-softAccent"
                      : "border-genz-border bg-white text-genz-muted"
                  } ${isCurrent ? "scale-110 ring-4 ring-genz-softAccent" : "scale-100"}`}
                >
                  {isCompleted ? (
                    <HiOutlineCheck size={20} strokeWidth={4} />
                  ) : (
                    <span className="text-sm font-black">{index + 1}</span>
                  )}
                </div>

                {/* STEP LABEL */}
                <div className="absolute -bottom-10 flex flex-col items-center whitespace-nowrap">
                   <p className={`text-[11px] font-black uppercase tracking-widest ${
                     isCompleted ? "text-genz-ink" : "text-genz-muted"
                   }`}>
                     {step}
                   </p>
                   {isCurrent && (
                     <span className="text-[9px] font-bold text-genz-accent animate-pulse">LIVE</span>
                   )}
                </div>
              </div>
            );
          })}

          {/* TERMINAL STATES (Cancelled / Returned) */}
          {(isCancelled || isReturned) && (
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-genz flex items-center justify-center border-2 shadow-lg z-20 ${
                  isCancelled 
                    ? "bg-red-500 border-red-500 text-white" 
                    : "bg-genz-accent border-genz-accent text-white"
                }`}
              >
                {isCancelled ? <HiOutlineXMark size={20} /> : <HiOutlineArrowPath size={20} />}
              </div>
              <p className={`text-[11px] mt-3 font-black uppercase tracking-widest absolute -bottom-10 whitespace-nowrap ${
                isCancelled ? "text-red-500" : "text-genz-accent"
              }`}>
                {status}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
