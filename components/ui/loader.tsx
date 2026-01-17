"use client";

export default function Loader({
  size = "md",
  text,
}: {
  size?: "sm" | "md" | "lg";
  text?: string;
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-brandPink border-t-transparent ${sizes[size]}`}
      />
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );
}
