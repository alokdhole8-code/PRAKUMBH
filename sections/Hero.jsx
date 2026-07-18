'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { GOLD } from "@/app/data/products";
import { INK } from "@/constants/colors";

// ─── HERO ────────────────────────────────────────────────────────────────────
export default function Hero() {
  const slides = useRef([
    "/assets/new01.webp",
    "/assets/new02.webp",
    "/assets/new03.webp",
  ]).current;
const [activeSlide, setActiveSlide] = useState(0);
const touchStartX = useRef(0);
const [isDesktop, setIsDesktop] = useState(null);

useEffect(() => {
  const checkScreen = () => {
    setIsDesktop(window.innerWidth >= 1024);
  };

  checkScreen();
  window.addEventListener("resize", checkScreen);

  return () => window.removeEventListener("resize", checkScreen);
}, []);
useEffect(() => {
const interval = setInterval(() => {
    setActiveSlide(prev => (prev + 1) % slides.length);
},5000);

return () => clearInterval(interval);
}, [activeSlide, slides.length]);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff > 50) {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }
      if (diff < -50) {
        setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
      }
    },
    [slides.length]
  );

  const goToSlide = useCallback((i) => setActiveSlide(i), []);

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        width: "100%",
height: isDesktop ? "50vw" : "75vw",
maxHeight: isDesktop ? "900px" : "none",
minHeight: isDesktop ? "650px" : "260px",    overflow: "hidden",
        background: INK,
      }}
    >
      {/* IMAGE */}
      {slides.map((slide, index) => (
        <Image
          key={slide}
          src={slide}
          alt={`Hero ${index + 1}`}
          fill
          // Only the first slide is eligible for LCP — preload it and let
          // the browser fetch the rest lazily/at low priority. Loading all
          // three with `priority` (as before) forced three eager, blocking
          // fetches on every page load, hurting LCP/TTFB contention.
          priority={index === 0}
           fetchPriority={index === 0 ? "high" : "low"}
          quality={45}
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: isDesktop ? "center 58%" : "center 85%",
             opacity: activeSlide === index ? 1 : 0,
            transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1)",
            position: "absolute",
transform:
  activeSlide === index
    ? `translateY(${isDesktop ? "30px" : "40px"}) scale(1)`
    : `translateY(${isDesktop ? "30px" : "40px"}) scale(1.03)`,
            transitionDuration: "1.1s, 6s",
          }}
        />
      ))}

      {/* LEGIBILITY GRADIENT */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,15,22,0.65) 0%, rgba(10,15,22,0.05) 32%, rgba(10,15,22,0) 55%, rgba(10,15,22,0.28) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* PROGRESS-BAR INDICATORS (visual upgrade of dots — same goToSlide handler) */}
      <div
        style={{
          position: "absolute",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          zIndex: 50,
        }}
      >
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => goToSlide(i)}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${i + 1}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToSlide(i);
            }}
            style={{
              width: 34,
              height: 3,
              borderRadius: 2,
              flexShrink: 0,
              cursor: "pointer",
              overflow: "hidden",
              background: "rgba(255,255,255,0.28)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "left",
                background: GOLD,
                transform: `scaleX(${activeSlide === i ? 1 : 0})`,
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
