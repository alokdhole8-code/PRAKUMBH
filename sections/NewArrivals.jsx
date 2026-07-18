'use client';
import { useRef, useMemo, useCallback } from "react";
import { products, GOLD, NAVY } from "@/app/data/products";
import { PARCHMENT, GOLD_GLOW, STONE } from "../constants/colors";
import { NEW_ARRIVAL_IDS } from "../constants/categories";
import useIsMobile from "../hooks/useIsMobile";
import ProductCard from "../components/ProductCard";

export default function NewArrivals({ setCartOpen, setCartItems, setPageLoading }) {
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

  const newArrivals = useMemo(
    () => products.filter((p) => NEW_ARRIVAL_IDS.includes(p.id)),
    []
  );

  const cardMinMax = isMobile
    ? "calc((100% - 14px) / 2)"
    : "calc((100% - 84px) / 4)";

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: "clamp(20px,4vw,10px) 0 clamp(0px,9vw,0px)",
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
              New Arrivals
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
            <span style={{ color: NAVY }}>LATEST </span>
            <span style={{ color: GOLD }}>DROPS</span>
          </h2>
        </div>

        {/* SLIDER */}
        <div style={{ position: "relative" }}>
          {/* LEFT */}
          <button
            onClick={scrollPrev}
            aria-label="Scroll to previous new arrivals"
            style={{
              position: "absolute",
              left: isMobile ? 4 : -10,
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
            ←
          </button>

          {/* RIGHT */}
          <button
            onClick={scrollNext}
            aria-label="Scroll to next new arrivals"
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
              fontSize: isMobile ? 15 : 24,
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

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="hide-scrollbar"
            style={{
              display: "flex",
              gap: isMobile ? 14 : 28,
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
overscrollBehaviorX: "contain",
              scrollSnapType: "x proximity",
              scrollbarWidth: "none",
              paddingBottom: 10,
              paddingRight: isMobile ? 6 : 28,
            }}
          >
            {newArrivals.map((p, i) => (
              <div
                key={p.id}
                style={{
                  minWidth: cardMinMax,
                  maxWidth: cardMinMax,
                  flex: "0 0 auto",
                  scrollSnapAlign: "start",
                }}
              >
                <div  >
                  <ProductCard
                    product={p}
                    setCartOpen={setCartOpen}
                    setCartItems={setCartItems}
                    setPageLoading={setPageLoading}
                    badge="NEW"
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
