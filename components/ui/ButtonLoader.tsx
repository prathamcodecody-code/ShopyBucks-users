"use client";

export default function ButtonLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      <span>Processing...</span>
    </div>
  );
}
