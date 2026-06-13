"use client";

import React from "react";

export function ShimmerButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-4 focus:ring-emerald-400/50 active:scale-95 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.7)] ${className}`}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#059669_0%,#34d399_50%,#059669_100%)]" />
      <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-emerald-400 hover:bg-emerald-300 px-8 py-4 text-lg font-bold text-emerald-950 backdrop-blur-3xl transition-colors">
        {children}
      </span>
    </button>
  );
}
