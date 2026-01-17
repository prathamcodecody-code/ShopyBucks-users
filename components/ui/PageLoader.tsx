"use client";

import Loader from "./loader";

export default function PageLoader({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  );
}
