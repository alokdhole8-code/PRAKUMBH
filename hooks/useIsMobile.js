'use client';
import { useState, useEffect } from "react";

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(null);
  useEffect(() => {
    let ticking = false;
    const check = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsMobile((prev) => {
          const next = window.innerWidth < 640;
          return prev === next ? prev : next;
        });
        ticking = false;
      });
    };
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}
