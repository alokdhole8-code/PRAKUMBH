'use client';
import { useRef, useMemo, useCallback } from "react";
import { products, GOLD, NAVY } from "@/app/data/products";
import { PARCHMENT, GOLD_GLOW, STONE } from "../constants/colors";
import useIsMobile from "../hooks/useIsMobile";
import ProductCard from "../components/ProductCard";

// ─── FEATURED SECTION ─────────────────────────────────────────────────────────
export default function FeaturedProducts({ setCartOpen, setCartItems, setPageLoading }) {
  const isMobile = useIsMobile();
  const sliderRef = useRef(null);

  const scroll = useCallback((dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === "next" ? 420 : -420,
      behavior: "smooth",
    });
  }, []);

  const scrollPrev = useCallback(() => scroll("prev"), [scroll]);
  const scrollNext = useCallback(() => scroll("next"), [scroll]);

  // `products` is a stable module import, so this only needs to run once.
  const featured = useMemo(() => products.slice(0, 8), []);

  const cardMinMax = isMobile
    ? "calc((100% - 12px) / 2)"
    : "calc((100% - 84px) / 4)";

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: "clamp(6px,7vw,50px) 0 clamp(0px,8vw,50px)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: 1700,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
             <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: STONE,
                fontWeight: 600,
              }}
            >
              Featured Collection
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(44px, 12vw, 96px)",
              lineHeight: 0.92,
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ color: NAVY }}>BESTSELLING </span>
            <span style={{ color: GOLD }}>NOW</span>
          </h2>
        </div>

        {/* SLIDER WRAPPER */}
        <div style={{ position: "relative" }}>
          {/* LEFT BUTTON */}
          <button
            onClick={scrollPrev}
            aria-label="Scroll to previous products"
            style={{
              position: "absolute",
              left: 10,
              top: "40%",
              transform: "translateY(-50%)",
              width: isMobile ? 42 : 54,
              height: isMobile ? 42 : 54,
              borderRadius: "999px",
              border: `1px solid ${GOLD_GLOW}`,
              background: "rgba(10,15,22,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#fff",
              zIndex: 99999,
              cursor: "pointer",
              fontSize: isMobile ? 15 : 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
          >
            ←
          </button>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollNext}
            aria-label="Scroll to next products"
            style={{
              position: "absolute",
              right: isMobile ? 4 : -10,
              top: "40%",
              transform: "translateY(-50%)",
              width: isMobile ? 42 : 54,
              height: isMobile ? 42 : 54,
              borderRadius: "999px",
              border: `1px solid ${GOLD_GLOW}`,
              background: "rgba(10,15,22,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#fff",
              zIndex: 40,
              cursor: "pointer",
              fontSize: isMobile ? 15 : 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(-50%) scale(1)")}
          >
            →
          </button>

          {/* HORIZONTAL CARDS */}
          <div
            ref={sliderRef}
            style={{
              display: "flex",
              gap: isMobile ? 14 : 28,
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
overscrollBehaviorX: "contain",
              scrollSnapType: "x proximity",
              contain: "layout paint",
              scrollbarWidth: "none",
              paddingBottom: 10,
            }}
            className="hide-scrollbar"
          >
            {featured.map((p, i) => (
              <div
                key={p.id}
                style={{
                  minWidth: cardMinMax,
                  maxWidth: cardMinMax,
                  flex: "0 0 auto",
                  scrollSnapAlign: "start",
                }}
              >
                <div >
                  <ProductCard
                    product={p}
                    setCartOpen={setCartOpen}
                    setCartItems={setCartItems}
                    setPageLoading={setPageLoading}
                    badge={i === 0 ? "BESTSELLER" : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
