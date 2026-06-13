"use client";

import React, { useEffect, useState } from "react";

export function WordPullUp({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth rendering after mount
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block mr-[0.25em]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
