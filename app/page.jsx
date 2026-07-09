'use client';
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { products, GOLD, NAVY, LIGHT, BORDER } from "./data/products";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { useCart } from "@/components/CartProvider";
import Image from "next/image";
import { handleBuyNow } from "@/lib/buyNow";

// ─── DESIGN TOKENS (new) ─────────────────────────────────────────────────────
// Premium neutral palette layered on top of the existing NAVY/GOLD brand
// colors. Purely presentational — no logic depends on these.
const INK = "#0A0F16"; // richer-than-flat-navy near-black for deep sections
const PARCHMENT = "#FFFFFF"; // warm off-white replacing flat #fff
const STONE = "#8C8578"; // warm grey for secondary copy
const HAIRLINE = "rgba(13,27,42,0.10)";
const GOLD_GLOW = "rgba(212,175,55,0.35)";
const GOLD_SOFT = "rgba(212,175,55,0.14)";

// ─── DATA ────────────────────────────────────────────────────────────────────
// Module-level constants are created once at import time (not per-render),
// so no extra memoization is needed for these arrays.
const SHOP_CATEGORIES = [
  {
    id: "unfiltered",
    label: "UNTITLED",
    image: "/assets/unfilteredd.jpeg",
  },
  {
    id: "shivaji",
    label: "CREATIVE GRAPHICS",
    image: "/assets/shivaji.jpeg",
  },
  {
    id: "swarajya",
    label: "FESTIVALS",
    image: "/assets/fest.jpeg",
  },
];

// NOTE: the original `categories` array (T-Shirt, Polo T-Shirts, ...) was
// declared but never referenced anywhere in the component tree. Removing
// dead code trims parse/compile work and bundle size with zero UI impact.

// ─── EASE ────────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1];

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────
// Centralised price parsing so the same logic isn't duplicated (and re-parsed)
// in three different places (cart drawer total, address modal total, order
// payload amount).
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const n = Number(String(priceStr).replace("₹", "").replace(".00", ""));
  return Number.isFinite(n) ? n : 0;
}

// Reused style fragments that never change between renders. Pulling these
// out of component bodies means React doesn't allocate a fresh object for
// them on every render (helps GC pressure on low-end mobile devices).
const QTY_BTN_BASE_STYLE = {
  height: "100%",
  border: "none",
  background: "#fff",
  fontSize: 22,
  cursor: "pointer",
  color: "#0D1B2A",
  fontWeight: 600,
  transition: "background 0.2s ease, color 0.2s ease",
};
const QTY_MINUS_STYLE = { ...QTY_BTN_BASE_STYLE, width: 42 };
const QTY_PLUS_STYLE = { ...QTY_BTN_BASE_STYLE, width: 48 };

// Shared "reveal on scroll" motion preset used across new + restyled
// sections so entrances feel consistent rather than ad hoc.
const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: EASE },
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
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

// ─── SIGNATURE MARK (new) ────────────────────────────────────────────────────
// The one recurring "signature" graphic for this redesign: a Rajmudra-style
// gold seal ring, echoed in the loader, the trust strip and section
// eyebrows. Purely decorative SVG, no props/state.
function SealMark({ size = 22 }) {
  return (
<svg
  width={size}
  height={size}
  viewBox="0 0 40 40"
  fill="none"
  aria-hidden="true"
  style={{
    width: `${size}px`,
    height: `${size}px`,
    display: "block",
    flexShrink: 0,
  }}
>
      <circle cx="20" cy="20" r="18" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="12.5" stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <path
        d="M20 10 L23 18 L31 20 L23 22 L20 30 L17 22 L9 20 L17 18 Z"
        fill={GOLD}
      />
    </svg>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const slides = useRef([
    "/assets/new01.webp",
    "/assets/new02.webp",
    "/assets/new03.webp",
  ]).current;
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
        height: "clamp(20px,50vw,970px)",
        overflow: "hidden",
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
          loading={index === 0 ? undefined : "lazy"}
          fetchPriority={index === 0 ? "high" : "low"}
          quality={60}
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            opacity: activeSlide === index ? 1 : 0,
            transition: "opacity 1.1s cubic-bezier(0.16,1,0.3,1)",
            position: "absolute",
            transform: activeSlide === index ? "scale(1.02)" : "scale(1.08)",
            transitionProperty: "opacity, transform",
            transitionDuration: "1.1s, 6s",
          }}
        />
      ))}

      {/* LEGIBILITY GRADIENT (new) */}
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

// ─── TRUST / USP STRIP (new section) ─────────────────────────────────────────
// Static, presentational only. Simple inline SVG icons so no new icon
// package dependency is introduced.
const TRUST_ITEMS = [
  {
    label: "Free Shipping",
    sub: "On every order, pan-India",
    icon: (
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM6.5 19a2 2 0 100-4 2 2 0 000 4zM17.5 19a2 2 0 100-4 2 2 0 000 4z" />
    ),
  },
  {
    label: "Premium Cotton",
    sub: "Heavyweight, built to last",
    icon: <path d="M8 3c1 2 1 3-1 5s-3 3-3 6a4 4 0 004 4h8a4 4 0 004-4c0-3-1-4-3-6s-2-3-1-5c-2 1-3 2-4 2s-2-1-4-2z" />,
  },
{
  label: "Made for Legacy",
  sub: "Inspired by Swarajya",
  icon:<path d="M12 2L5 5v6c0 5 3.5 9 7 11 3.5-2 7-6 7-11V5l-7-3z" />,
},
{
  label: "High Quality Prints",
  sub: "Fade Resistant Colors",
  icon: <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zm7 9l.8 2.2L22 15l-2.2.8L19 18l-.8-2.2L16 15l2.2-.8L19 12zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />,
},
];

const TrustStrip = memo(function TrustStrip() {
  const isMobile = useIsMobile();
  return (
    <m.section
      {...REVEAL}
      style={{
        background: PARCHMENT,
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
        padding: isMobile ? "22px 16px" : "26px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 18 : 20,
        }}
      >
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              {item.icon}
            </svg>
            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  color: NAVY,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </div>
              {!isMobile && (
                <div style={{ fontSize: 12, color: STONE, marginTop: 2 }}>
                  {item.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </m.section>
  );
});

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  setCartOpen,
  setCartItems,
  setPageLoading,
  badge, // NEW optional presentational prop — visual "NEW"/"BESTSELLER" ribbon only
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    product.defaultColor || "black"
  );

  const handleHoverStart = useCallback(() => setHovered(true), []);
  const handleHoverEnd = useCallback(() => setHovered(false), []);

  const goToProduct = useCallback(() => {
    setPageLoading(true);
    router.push(`/product/${product.id}`);
  }, [router, product.id, setPageLoading]);

  const handleKeyDownCard = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToProduct();
      }
    },
    [goToProduct]
  );

  // Memoized so selecting a color re-renders only what actually needs it,
  // and the function identity is stable for child click handlers.
  const handleSelectColor = useCallback((e, colorKey) => {
    e.stopPropagation();
    setSelectedColor(colorKey);
  }, []);

  const backImage = product.images?.[selectedColor]?.back;

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation();

      const cartProduct = {
        ...product,
        selectedColor,
        selectedSize: "M",
        quantity: 1,
        image:
          product.images?.[selectedColor]?.back ||
          product.images?.[product.defaultColor || "black"]?.back,
      };

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === "M"
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + 1,
          };
          return updated;
        }

        return [...prev, cartProduct];
      });

      setCartOpen(true);
    },
    [product, selectedColor, setCartItems, setCartOpen]
  );

  // Colour keys rarely change (only when `product` changes), so avoid
  // recomputing Object.keys(...) on every hover/color-selection re-render.
  const colorKeys = useMemo(
    () => Object.keys(product.images || {}),
    [product.images]
  );

  return (
    <m.div
      onClick={goToProduct}
      onKeyDown={handleKeyDownCard}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: EASE }}
      style={{
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          background: "#f4f1ea",
          marginBottom: 14,
          boxShadow: hovered
            ? "0 22px 40px rgba(13,27,42,0.16)"
            : "0 8px 20px rgba(13,27,42,0.06)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {badge && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 5,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(10,15,22,0.85)",
              backdropFilter: "blur(6px)",
              color: GOLD,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              border: `1px solid ${GOLD_GLOW}`,
            }}
          >
            {badge}
          </div>
        )}

        <m.div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Image
            src={backImage}
            alt={product.name}
            width={600}
            height={700}
            loading="lazy"
            sizes="(max-width:768px) 50vw, 25vw"
            quality={60}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
        </m.div>

        {/* ADD TO CART */}
        {!isMobile && (
          <m.button
            initial={{ y: 100 }}
            animate={{ y: hovered ? 0 : 100 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 14,
              height: 54,
              borderRadius: 10,
              border: "none",
              background: "#0D1B2A",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.14em",
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(13,27,42,0.35)",
            }}
          >
            ADD TO CART
          </m.button>
        )}
      </div>

      {/* INFO */}
      <div>
        <h3
          style={{
            fontSize: 19,
            lineHeight: 1.4,
            marginBottom: 8,
            color: "#111",
            fontWeight: 500,
          }}
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#111",
              lineHeight: 1,
            }}
          >
            {product.price}
          </span>

          <span
            style={{
              fontSize: 15,
              color: "#a8a196",
              textDecoration: "line-through",
            }}
          >
            {product.oldPrice}
          </span>
        </div>

        {/* COLORS */}
        <div
          className="shop-category-grid"
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {colorKeys.map((colorKey, i) => (
            <div
              key={i}
              onClick={(e) => handleSelectColor(e, colorKey)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${colorKey} color`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setSelectedColor(colorKey);
                }
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background:
                  colorKey === "black"
                    ? "#111"
                    : colorKey === "blue"
                    ? "#2563EB"
                    : colorKey === "grey"
                    ? "#6B7280"
                    : "#F5F5F5",
                boxShadow:
                  selectedColor === colorKey
                    ? `0 0 0 2px #fff, 0 0 0 4px ${NAVY}`
                    : colorKey === "white"
                    ? "0 0 0 1px #ccc"
                    : "0 0 0 1px #dcdcdc",
                transform: selectedColor === colorKey ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </m.div>
  );
});

// ─── FEATURED SECTION ─────────────────────────────────────────────────────────
function FeaturedProducts({ setCartOpen, setCartItems, setPageLoading }) {
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
        <m.div {...REVEAL} style={{ marginTop: 0, marginBottom: 34 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 40, height: 2, background: GOLD }} />
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
        </m.div>

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
                <m.div {...REVEAL} transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.06 }}>
                  <ProductCard
                    product={p}
                    setCartOpen={setCartOpen}
                    setCartItems={setCartItems}
                    setPageLoading={setPageLoading}
                    badge={i === 0 ? "BESTSELLER" : undefined}
                  />
                </m.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ShopByCategory = memo(function ShopByCategory({ setPageLoading }) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const goToCategory = useCallback(
    (catId) => {
      setPageLoading(true);
      router.push(`/shop?category=${catId}`);
    },
    [router, setPageLoading]
  );

  return (
    <section
      style={{
        padding: isMobile ? "0px 16px" : "10px 40px",
        background: "#FFFFFF",
      }}
    >
      <m.div {...REVEAL} style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ width: 40, height: 2, background: GOLD }} />
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
            The Edit
          </span>
          <div style={{ width: 40, height: 2, background: GOLD }} />
        </div>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px,6vw,52px)",
            color: NAVY,
            letterSpacing: "0.02em",
          }}
        >
          SHOP BY CATEGORY
        </h2>
      </m.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 16 : 28,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {SHOP_CATEGORIES.map((cat, i) => (
          <m.div
            key={cat.id}
            {...REVEAL}
            transition={{ duration: 0.65, ease: EASE, delay: i * 0.08 }}
            onClick={() => goToCategory(cat.id)}
            role="button"
            tabIndex={0}
            aria-label={`Shop ${cat.label}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToCategory(cat.id);
            }}
            className="category-card"
            style={{
              position: "relative",
              aspectRatio: "0.75",
              overflow: "hidden",
              borderRadius: 20,
              cursor: "pointer",
              boxShadow: "0 18px 40px rgba(13,27,42,0.14)",
            }}
          >
            <div
              className="category-card-img"
              style={{
                position: "absolute",
                inset: 0,
                transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width:768px) 50vw, 33vw"
                loading="lazy"
                style={{
                  objectFit: "cover",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(10,15,22,0.82), rgba(10,15,22,0.08) 55%, rgba(10,15,22,0.02))",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 22,
                left: 16,
                right: 16,
                textAlign: "center",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 1,
                  background: GOLD,
                  margin: "0 auto 10px",
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  fontSize: isMobile ? 15 : 18,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                {cat.label}
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* scoped hover styles for the gold underline + zoom (visual only) */}
      <style>{`
        .category-card:hover .category-card-img { transform: scale(1.08); }
      `}</style>
    </section>
  );
});

const NEW_ARRIVAL_IDS = [
  "fearless",
  "legacy-never-dies",
  "rise-to-victory",
  "the-vanguard",
  "ranaragini",
  "strength",
];

function NewArrivals({ setCartOpen, setCartItems, setPageLoading }) {
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
        <m.div {...REVEAL} style={{ marginTop: 0, marginBottom: 34 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 40, height: 2, background: GOLD }} />
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
        </m.div>

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
                <m.div {...REVEAL} transition={{ duration: 0.6, ease: EASE, delay: (i % 4) * 0.06 }}>
                  <ProductCard
                    product={p}
                    setCartOpen={setCartOpen}
                    setCartItems={setCartItems}
                    setPageLoading={setPageLoading}
                    badge="NEW"
                  />
                </m.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Purely static markup with no props — memoizing means it never re-renders
// when parent state (cart, page loading, scroll bar, etc.) changes.
const WarriorStrip = memo(function WarriorStrip() {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${INK} 0%, ${NAVY} 100%)`,
        overflow: "hidden",
        height: 38,
        display: "flex",
        alignItems: "center",
        marginBottom: 0,
        position: "relative",
        borderTop: `1px solid ${GOLD_SOFT}`,
        borderBottom: `1px solid ${GOLD_SOFT}`,
      }}
    >
 

      {/* subtle repeating diagonal texture behind the marquee — decorative only */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 1px, transparent 14px)",
          pointerEvents: "none",
        }}
      />

<div
  style={{
    position: "relative",
    display: "inline-flex",
    whiteSpace: "nowrap",
    alignItems: "center",
    width: "max-content",
    animation: "warriorMarquee 20s linear infinite",
    willChange: "transform",
  }}
>
<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>
<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>

      </div>
    </section>
  );
});

// ─── MANIFESTO / BRAND STATEMENT (new section) ───────────────────────────────
// Cinematic full-bleed background with a large typographic statement.
// Static/presentational — no props, no state.
const Manifesto = memo(function Manifesto() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        position: "relative",
        minHeight: isMobile ? 380 : 560,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: INK,
      }}
    >
      <Image
        src="/assets/shivaji.jpeg"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        style={{ objectFit: "cover", opacity: 0.55 }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,15,22,0.55) 0%, rgba(10,15,22,0.85) 100%)",
        }}
      />

      <m.div
        {...REVEAL}
        style={{
          position: "relative",
          maxWidth: 900,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <SealMark size={80} />
        </div>
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 5.5vw, 52px)",
            lineHeight: 1.15,
            letterSpacing: "0.01em",
            color: "#F7F3EA",
            marginBottom: 22,
          }}
        >
          NOT JUST CLOTHING —{" "}
          <span style={{ color: GOLD }}>A DECLARATION OF SWARAJYA.</span>
        </p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            letterSpacing: "0.08em",
            color: "rgba(247,243,234,0.75)",
            lineHeight: 1.7,
            textTransform: "uppercase",
          }}
        >
          Every stitch carries the discipline of the Mavalas and the
          sovereignty of a kingdom built on courage. Worn by those who refuse
          to be ordinary.
        </p>
      </m.div>
    </section>
  );
});

const OurStory = memo(function OurStory() {
  const isMobile = useIsMobile();

  const goToShop = useCallback(() => {
    window.location.href = "/shop";
  }, []);

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: isMobile ? "0px 10px" : "60px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : 90,
          textAlign: isMobile ? "center" : "left",
          alignItems: "center",
        }}
      >
        {/* IMAGE */}
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ order: 1 }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: 26,
              overflow: "hidden",
              background: "#F0EADB",
              padding: "12px",
              boxShadow: "0 30px 70px rgba(10,15,22,0.18)",
              height: isMobile ? "320px" : "540px",
              border: `1px solid ${GOLD_SOFT}`,
            }}
          >
            <Image
              src="/assets/our-story.jpeg"
              alt="Our Story"
              fill
              loading="lazy"
              sizes="(max-width:768px) 100vw, 50vw"
              style={{
                objectFit: "cover",
                borderRadius: 18,
              }}
            />
            {/* Golden Glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(13,27,42,0.3), transparent 45%)",
                pointerEvents: "none",
                borderRadius: 24,
              }}
            />
          </div>
        </m.div>

        {/* CONTENT */}
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-start",
              alignItems: "center",
              gap: 20,
              marginBottom: 16,
            }}
          >
            <div style={{ width: 40, height: 2, background: GOLD }} />
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: STONE,
                fontWeight: 600,
              }}
            >
              Our Legacy
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px,8vw,92px)",
              lineHeight: 0.94,
              marginBottom: 26,
            }}
          >
            <span style={{ color: NAVY }}>OUR </span>
            <span style={{ color: GOLD }}>STORY</span>
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.85,
              color: "#4A4438",
              marginBottom: 34,
            }}
          >
            Prakumbh was born from the spirit of Hindavi Swarajya and the
            timeless legacy of Chhatrapati Shivaji Maharaj. Every design
            carries the courage of the Mavalas, the pride of Maharashtra and
            the stories of warriors who shaped history.
          </p>

          <button
            onClick={goToShop}
            style={{
              height: 56,
              padding: "0 34px",
              borderRadius: 10,
              border: "none",
              background: "#0D1B2A",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: "0.12em",
              boxShadow: "0 14px 30px rgba(13,27,42,0.25)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 18px 36px rgba(13,27,42,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 14px 30px rgba(13,27,42,0.25)";
            }}
          >
            EXPLORE COLLECTION →
          </button>
        </m.div>
      </div>
    </section>
  );
});

// ─── LOOKBOOK — "AS WORN BY WARRIORS" (new section) ──────────────────────────
// Editorial-style image grid. Reuses existing brand imagery — no new assets.
const LOOKBOOK_IMAGES = [
  "/assets/new02.webp",
  "/assets/unfilteredd.jpeg",
  "/assets/new03.webp",
  "/assets/fest.jpeg",
];

 

// ─── TESTIMONIALS (new section, placeholder data) ────────────────────────────
// Clearly-marked dummy reviews — no real customer names or quotes.
const TESTIMONIALS = [
  {
    quote:
      "Placeholder review — fabric quality felt premium and the print held up after several washes.",
    author: "Verified Buyer",
  },
  {
    quote:
      "Placeholder review — fit was true to size and delivery was quicker than expected.",
    author: "Verified Buyer",
  },
  {
    quote:
      "Placeholder review — the design detail on the back print is the standout for me.",
    author: "Verified Buyer",
  },
];

 

// ─── INSTAGRAM / UGC STRIP ────────────────────────────────────────────────────
const IG_URL =
  "https://www.instagram.com/prakumbhclothing?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

const REELS = [
  "/reels/reel1.mp4",
  "/reels/reel2.mp4",
  "/reels/reel3.mp4",
  "/reels/reel4.mp4",
  "/reels/reel5.mp4",
  "/reels/reel6.mp4",
  "/reels/reel7.mp4",
];

// Respects the OS-level "reduce motion" preference — when true, the
// automatic marquee simply doesn't run (manual drag still works).
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);
  return reduced;
}

// Measures the wrapper via ResizeObserver and derives how many cards are
// visible (3 desktop / 2 tablet / 2 mobile) plus the exact card width in px
// for that breakpoint, so the marquee math (translate distance per card) is
// always pixel-accurate — no CSS % guesswork.
function useReelLayout(containerRef) {
  const [layout, setLayout] = useState({ visible: 3, cardWidth: 0, gap: 24 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const width = el.offsetWidth;
      if (!width) return;
      let visible = 3;
      let gap = 24;
if (width < 640) {
  visible = 2;
} else if (width < 1024) {
  visible = 3;
} else if (width < 1440) {
  visible = 5;
} else {
  visible = 6;
}
      const cardWidth = (width - gap * (visible - 1)) / visible;
      setLayout((prev) =>
        prev.visible === visible && Math.abs(prev.cardWidth - cardWidth) < 0.5
          ? prev
          : { visible, cardWidth, gap }
      );
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("orientationchange", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", compute);
    };
  }, [containerRef]);

  return layout;
}

// Single reel card. Memoized on (src, width) so re-renders triggered by the
// marquee's array-rotation state update never touch cards whose props
// haven't changed — React just reorders the existing DOM nodes (same key =
// same underlying <video>, so playback is never interrupted or reloaded).
const ReelCard = memo(function ReelCard({ src, width, reelNumber, onOpen }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  return (
    <div
      className="reel-card gpu-layer"
      role="button"
      tabIndex={0}
      aria-label={`Instagram reel ${reelNumber} — open @prakumbhclothing on Instagram`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        flex: `0 0 ${width}px`,
        width,
        height:
  typeof window !== "undefined" && window.innerWidth >= 1024
    ? 560
    : undefined,

aspectRatio:
  typeof window !== "undefined" && window.innerWidth >= 1024
    ? undefined
    : "9 / 16",
        borderRadius: 24,
        overflow: "hidden",
        cursor: "pointer",
        background: INK,
        border: "1px solid rgba(255,255,255,0.16)",
        boxShadow:
          "0 22px 50px rgba(10,15,22,0.22), 0 4px 14px rgba(10,15,22,0.10)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,15,22,0.5) 0%, rgba(10,15,22,0) 38%)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="1" fill="#fff" stroke="none" />
        </svg>
      </div>
    </div>
  );
});

// ── The marquee itself ───────────────────────────────────────────────────────
// Technique: exactly REELS.length DOM nodes exist at all times (no
// duplicated arrays). A single `order` array (state) holds the current
// left-to-right sequence of reel indices. Every frame, requestAnimationFrame
// nudges a translate3d() offset applied directly to the track's DOM node
// (imperative — no React re-render per frame, so it stays at 60fps). The
// moment that offset reaches exactly one card-width, the first entry of
// `order` is rotated to the end (a real state update — cheap, since it just
// reorders 7 items) and the offset is compensated by the same amount, so the
// rotation is visually seamless: nothing jumps, nothing blanks, nothing
// restarts. Because array order — not video src — drives position, React
// keeps reusing the same <video> DOM nodes (stable key = reel path), so
// playback continuity is preserved across the rotation.
const InstagramGallery = memo(function InstagramGallery() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const { visible, cardWidth, gap } = useReelLayout(wrapperRef);
  const reducedMotion = usePrefersReducedMotion();

  const [order, setOrder] = useState(() => REELS.map((_, i) => i));

  const itemWidth = cardWidth + gap;

  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const momentumRafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const velocityRef = useRef(0);

  const SPEED = 38; // px / second, gentle Apple/Netflix-style drift

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    }
  }, []);

  const rotateForward = useCallback(() => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const next = prev.slice(1);
      next.push(prev[0]);
      return next;
    });
  }, []);

  const rotateBackward = useCallback(() => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const next = prev.slice(0, prev.length - 1);
      next.unshift(prev[prev.length - 1]);
      return next;
    });
  }, []);

  // Re-apply the (unchanged) pixel offset after every order-driven re-render
  // so the rotated DOM never flashes at transform:none for a frame.
  useEffect(() => {
    applyTransform();
  }, [order, applyTransform]);

  // Continuous auto-scroll loop.
  useEffect(() => {
    if (reducedMotion || !itemWidth || Number.isNaN(itemWidth)) return;
    lastTimeRef.current = null;

    const step = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      if (!pausedRef.current && !draggingRef.current) {
        offsetRef.current -= SPEED * dt;
        if (offsetRef.current <= -itemWidth) {
          offsetRef.current += itemWidth;
          rotateForward();
        } else {
          applyTransform();
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [itemWidth, reducedMotion, rotateForward, applyTransform]);

  // Desktop hover pause / resume.
  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
  }, []);

  // Pointer-based drag (mobile finger drag + desktop click-drag), with
  // rotation kept in sync mid-drag so dragging can never run out of cards.
  const handlePointerDown = useCallback(
    (e) => {
      if (!itemWidth || Number.isNaN(itemWidth)) return;
      draggingRef.current = true;
      movedRef.current = false;
      pausedRef.current = true;

      const x = e.clientX;
      dragStartXRef.current = x;
      dragStartOffsetRef.current = offsetRef.current;
      lastDragXRef.current = x;
      lastDragTimeRef.current = performance.now();
      velocityRef.current = 0;

      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current);
        momentumRafRef.current = null;
      }
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [itemWidth]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current || !itemWidth) return;
      const x = e.clientX;
      const dx = x - dragStartXRef.current;
      if (Math.abs(dx) > 4) movedRef.current = true;

      const now = performance.now();
      const dt = now - lastDragTimeRef.current;
      if (dt > 0) velocityRef.current = (x - lastDragXRef.current) / dt;
      lastDragXRef.current = x;
      lastDragTimeRef.current = now;

      offsetRef.current = dragStartOffsetRef.current + dx;

      while (offsetRef.current <= -itemWidth) {
        offsetRef.current += itemWidth;
        dragStartOffsetRef.current += itemWidth;
        rotateForward();
      }
      while (offsetRef.current >= itemWidth) {
        offsetRef.current -= itemWidth;
        dragStartOffsetRef.current -= itemWidth;
        rotateBackward();
      }
      applyTransform();
    },
    [itemWidth, rotateForward, rotateBackward, applyTransform]
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    let v = velocityRef.current * 1000; // px/sec
    const maxV = 1400;
    v = Math.max(-maxV, Math.min(maxV, v));
    const friction = 0.94;

    const momentumStep = () => {
      if (Math.abs(v) < 12 || !itemWidth) {
        pausedRef.current = false;
        momentumRafRef.current = null;
        return;
      }
      offsetRef.current += v / 60;
      v *= friction;

      while (offsetRef.current <= -itemWidth) {
        offsetRef.current += itemWidth;
        rotateForward();
      }
      while (offsetRef.current >= itemWidth) {
        offsetRef.current -= itemWidth;
        rotateBackward();
      }
      applyTransform();
      momentumRafRef.current = requestAnimationFrame(momentumStep);
    };

    momentumRafRef.current = requestAnimationFrame(momentumStep);
  }, [itemWidth, rotateForward, rotateBackward, applyTransform]);

  const openProfile = useCallback(() => {
    if (movedRef.current) return; // was a drag, not a tap/click
    window.open(IG_URL, "_blank", "noopener,noreferrer");
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!itemWidth) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        offsetRef.current += itemWidth;
        rotateForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotateBackward();
      }
    },
    [itemWidth, rotateForward, rotateBackward]
  );

  const viewportWidth =
    itemWidth && !Number.isNaN(itemWidth)
      ? visible * cardWidth + (visible - 1) * gap
      : "100%";

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: "clamp(0px,6vw,0px) 0 clamp(0px,9vw,110px)",
      }}
      aria-label="Instagram reels gallery"
    >
      <div style={{ width: "95%", maxWidth: 1700, margin: "0 auto" }}>
        <div style={{ marginBottom: 34, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 40, height: 2, background: GOLD }} />
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
              Follow The Movement
            </span>
            <div style={{ width: 40, height: 2, background: GOLD }} />
          </div>
<h2
  onClick={() =>
    window.open(
      "https://www.instagram.com/prakumbhclothing",
      "_blank",
      "noopener,noreferrer"
    )
  }
  style={{
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(40px,9vw,80px)",
    color: NAVY,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "color .25s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
  onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
>
  @PRAKUMBHCLOTHING
</h2>
        </div>

        <div
          ref={wrapperRef}
          role="group"
          tabIndex={0}
          aria-label="Instagram reels carousel — use arrow keys to navigate, opens Instagram profile on select"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
style={{
  width: "100%",
  margin: "0 auto",
  overflow: "hidden",
}}
        >
          <div
            ref={trackRef}
            className="gpu-layer"
            style={{
              display: "flex",
              gap,
              transform: "translate3d(0,0,0)",
            }}
          >
            {order.map((reelIdx) => (
              <ReelCard
                key={reelIdx}
                src={REELS[reelIdx]}
                width={cardWidth || 1}
                reelNumber={reelIdx + 1}
                onOpen={openProfile}
              />
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
@keyframes warriorMarquee {
  from {
    transform: translate3d(0,0,0);
  }

  to {
    transform: translate3d(-50%,0,0);
  }
}
`}</style>
    </section>
  );
});

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function WarriorWorldHomepage() {
  const isMobile = useIsMobile();
  const { cartOpen, setCartOpen, cartItems, setCartItems } = useCart();

  const [barHidden, setBarHidden] = useState(false);
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    setPageLoading(false);
  }, [pathname]);

  const [addressOpen, setAddressOpen] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const isFormValid = useMemo(
    () =>
      Boolean(
        fullName.trim() &&
          phone.trim() &&
          address.trim() &&
          city.trim() &&
          pincode.trim()
      ),
    [fullName, phone, address, city, pincode]
  );

  // Computed once per cartItems change and shared by the drawer total, the
  // address-modal total and the order payload — previously this exact
  // reduce() was re-run three separate times per render.
  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + parsePrice(item.price) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const cartQuantity = useMemo(
    () => cartItems.reduce((t, i) => t + (i.quantity || 1), 0),
    [cartItems]
  );

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const hidden = window.scrollY > 40;
          setBarHidden((prev) => (prev === hidden ? prev : hidden));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDecreaseQty = useCallback(
    (id) => {
      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: Math.max(1, (cartItem.quantity || 1) - 1) }
            : cartItem
        )
      );
    },
    [setCartItems]
  );

  const handleIncreaseQty = useCallback(
    (id) => {
      setCartItems((prev) =>
        prev.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        )
      );
    },
    [setCartItems]
  );

  const handleRemoveItem = useCallback(
    (id) => {
      setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== id));
    },
    [setCartItems]
  );

  const handleBuyNowClick = useCallback(() => {
    handleBuyNow({ cartItems, setAddressOpen, setBuyNowProduct });
  }, [cartItems]);

  const closeCart = useCallback(() => setCartOpen(false), [setCartOpen]);
  const closeAddressModal = useCallback(() => setAddressOpen(false), []);

  // Fire-and-forget analytics/order-sync call to Google Apps Script, now a
  // proper async function with error handling instead of a bare .catch().
  const sendOrderToAppsScript = useCallback(async (orderPayload) => {
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxYG8KeTKrt2sLhhrCyJ52m0E5XWUTzZYsYcmObNoDJm5q_ol_jXv_1XIM-lnTo-YsrLg/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(orderPayload),
        }
      );
    } catch (err) {
      console.error("Failed to sync order with Google Apps Script:", err);
    }
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!isFormValid) return;

    const message = "Send this message to confirm your order.";

    // Guarded localStorage access — corrupted/missing data no longer throws.
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("prakumbh_current") || "null"
      );

      if (currentUser) {
        const users = JSON.parse(
          localStorage.getItem("prakumbh_users") || "[]"
        );
        const userIndex = users.findIndex((u) => u.id === currentUser.id);

        if (userIndex !== -1) {
          const orderData = {
            id: "ORD" + Date.now(),
            date: new Date().toISOString(),
            status: "Processing",
            items: cartItems.map((item) => ({
              ...item,
              image:
                item.images?.[
                  item.selectedColor || item.defaultColor || "black"
                ]?.back || "",
            })),
            total: cartTotal,
            shippingAddress: {
              name: fullName,
              phone,
              line1: address,
              line2: landmark,
              city,
              pincode,
            },
          };

          if (!users[userIndex].orders) {
            users[userIndex].orders = [];
          }
          users[userIndex].orders.unshift(orderData);
          localStorage.setItem("prakumbh_users", JSON.stringify(users));
        }
      }
    } catch (err) {
      console.error("Failed to persist order to localStorage:", err);
    }

    const orderPayload = {
      orderId: "PK" + Date.now(),
      date: new Date().toLocaleString(),
      name: fullName,
      phone,
      address,
      city,
      state: "Maharashtra",
      pincode,
      product: cartItems
        .map(
          (item) =>
            `${item.name} | Color: ${item.selectedColor} | Size: ${item.selectedSize}`
        )
        .join(" || "),
      quantity: cartQuantity,
      amount: cartTotal,
    };

    const whatsappUrl = `https://wa.me/918766599895?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");

    setAddressOpen(false);
    setCartOpen(false);
    setCartItems([]);

    setFullName("");
    setPhone("");
    setAddress("");
    setLandmark("");
    setCity("");
    setPincode("");

    setTimeout(() => {
      sendOrderToAppsScript(orderPayload);
    }, 0);
  }, [
    isFormValid,
    cartItems,
    cartTotal,
    cartQuantity,
    fullName,
    phone,
    address,
    landmark,
    city,
    pincode,
    setCartOpen,
    setCartItems,
    sendOrderToAppsScript,
  ]);

  return (
    <LazyMotion features={domAnimation}>
      {/* GOOGLE FONTS + MATERIAL SYMBOLS */}
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
@media (min-width: 900px) {
  .shop-category-grid {
    grid-template-columns: repeat(3,1fr);
  }
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: 'Barlow Condensed', sans-serif; background: #F7F3EA; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #ccc; }
button { outline: none; }
.group:hover .group-hover\\:w-full { width: 100% !important; }
body {
  overflow-x: hidden;
  text-rendering: optimizeSpeed;
  -webkit-font-smoothing: antialiased;
}

.gpu-layer {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
* {
  -webkit-tap-highlight-color: transparent;
}
      `}</style>

      <div>
        <AnnouncementBar hidden={barHidden} />
        <Navbar
          barHidden={barHidden}
          setCartOpen={setCartOpen}
          cartItems={cartItems}
          setPageLoading={setPageLoading}
        />
        <div
          style={{
            paddingTop: 92,
            transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <Hero />

          {/* NEW: trust / USP strip */}
          <TrustStrip />

          <ShopByCategory setPageLoading={setPageLoading} />

          <FeaturedProducts
            setCartOpen={setCartOpen}
            setCartItems={setCartItems}
            setPageLoading={setPageLoading}
          />

          <WarriorStrip />

          {/* NEW: brand manifesto / statement section */}
          {/* <Manifesto /> */}

          <NewArrivals
            setCartOpen={setCartOpen}
            setCartItems={setCartItems}
            setPageLoading={setPageLoading}
          />

          <OurStory />

          
          <InstagramGallery />
        </div>

        {/* CART DRAWER */}
        <AnimatePresence>
          {cartOpen && (
            <>
              {/* OVERLAY */}
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={closeCart}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(10,15,22,0.55)",
                  backdropFilter: "blur(2px)",
                  zIndex: 2147483646,
                }}
              />

              {/* DRAWER */}
              <m.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: 380,
                  maxWidth: "100%",
                  height: "100dvh",
                  background: "#fff",
                  zIndex: 2147483647,
                  padding: "18px 24px calc(18px + env(safe-area-inset-bottom))",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "-20px 0 60px rgba(10,15,22,0.25)",
                }}
              >
                {/* CLOSE */}
                <button
                  onClick={closeCart}
                  aria-label="Close cart"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 34,
                    cursor: "pointer",
                    alignSelf: "flex-end",
                    lineHeight: 1,
                    color: "#222",
                  }}
                >
                  ×
                </button>

                {cartItems.length > 0 ? (
                  <>
                    <div
                      style={{
                        marginTop: 40,
                        overflowY: "auto",
                        flex: 1,
                      }}
                    >
                      <AnimatePresence initial={false}>
                        {cartItems.map((item, i) => (
                          <m.div
                            key={item.id ?? i}
                            layout
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            style={{
                              display: "flex",
                              gap: 20,
                              alignItems: "flex-start",
                              paddingBottom: 24,
                              marginBottom: 24,
                              borderBottom: "1px solid #ececec",
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              src={
                                item.image ||
                                item.images?.[
                                  item.selectedColor ||
                                    item.defaultColor ||
                                    "black"
                                ]?.back
                              }
                              alt={item.name}
                              width={110}
                              height={140}
                              style={{
                                width: "110px",
                                height: "140px",
                                objectFit: "contain",
                                background: "#f7f7f7",
                                borderRadius: "8px",
                                padding: "4px",
                                flexShrink: 0,
                              }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* TOP */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: 14,
                                }}
                              >
                                <div>
                                  <h4
                                    style={{
                                      fontSize: 18,
                                      lineHeight: 1.5,
                                      color: "#111",
                                      fontWeight: 500,
                                      maxWidth: 160,
                                      marginBottom: 8,
                                    }}
                                  >
                                    {item.name}
                                  </h4>

                                  <p
                                    style={{
                                      fontSize: 15,
                                      color: "#444",
                                      marginBottom: 14,
                                    }}
                                  >
                                    {item.selectedColor || "Black"} ·{" "}
                                    {item.selectedSize || "M"}
                                  </p>

                                  {/* PRICE */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      marginBottom: 18,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "#000",
                                      }}
                                    >
                                      {item.price}
                                    </span>

                                    <span
                                      style={{
                                        fontSize: 15,
                                        color: "#aaa",
                                        textDecoration: "line-through",
                                      }}
                                    >
                                      ₹699.00
                                    </span>
                                  </div>

                                  {/* CONTROLS */}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                    }}
                                  >
                                    {/* QUANTITY */}
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #e5e5e5",
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        height: 50,
                                      }}
                                    >
                                      <button
                                        onClick={() => handleDecreaseQty(item.id)}
                                        aria-label="Decrease quantity"
                                        style={QTY_MINUS_STYLE}
                                      >
                                        −
                                      </button>

                                      <div
                                        style={{
                                          width: 48,
                                          textAlign: "center",
                                          fontSize: 18,
                                          fontWeight: 600,
                                          color: "#111",
                                        }}
                                      >
                                        {item.quantity || 1}
                                      </div>

                                      <button
                                        onClick={() => handleIncreaseQty(item.id)}
                                        aria-label="Increase quantity"
                                        style={QTY_PLUS_STYLE}
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* DELETE */}
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      aria-label={`Remove ${item.name} from cart`}
                                      style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                      }}
                                    >
                                      <span
                                        className="material-symbols-outlined"
                                        style={{ color: "#222" }}
                                      >
                                        delete
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </m.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* BUY NOW SECTION */}
                    <div
                      style={{
                        borderTop: "1px solid #ececec",
                        paddingTop: 18,
                        marginTop: 10,
                        position: "sticky",
                        bottom: 0,
                        background: "#fff",
                        zIndex: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            color: "#444",
                            fontWeight: 500,
                          }}
                        >
                          Estimated total
                        </span>

                        <span
                          style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#111",
                            lineHeight: 1,
                          }}
                        >
                          ₹{cartTotal}.00
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: isMobile ? 11 : 14,
                          color: "#666",
                          marginBottom: 18,
                          lineHeight: 1.5,
                        }}
                      >
                        Duties and taxes included. Shipping is calculated at
                        checkout.
                      </p>

                      <button
                        onClick={handleBuyNowClick}
                        style={{
                          width: "100%",
                          height: 62,
                          borderRadius: 16,
                          border: "none",
                          background: "#0D1B2A",
                          color: "#fff",
                          fontSize: 19,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          cursor: "pointer",
                          boxShadow: "0 14px 30px rgba(13,27,42,0.3)",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        BUY NOW →
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      marginTop: -20,
                    }}
                  >
                    {/* premium empty-state illustration — decorative only */}
                    <svg width="86" height="86" viewBox="0 0 86 86" fill="none" aria-hidden="true" style={{ marginBottom: 22 }}>
                      <circle cx="43" cy="43" r="42" stroke="#E5E0D3" strokeWidth="1.5" />
                      <path
                        d="M26 33h34l-3 26a4 4 0 01-4 3.5H33a4 4 0 01-4-3.5L26 33z"
                        stroke={NAVY}
                        strokeWidth="1.6"
                      />
                      <path d="M32 33v-5a11 11 0 0122 0v5" stroke={GOLD} strokeWidth="1.6" />
                    </svg>

                    <h2
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        color: "#1f2a44",
                        marginBottom: 12,
                        fontFamily: "'Bebas Neue', sans-serif",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Your cart is empty
                    </h2>

                    <p
                      style={{
                        fontSize: 16,
                        color: "#222",
                        marginBottom: 28,
                      }}
                    >
                      Have an account?{" "}
                      <span style={{ textDecoration: "underline" }}>
                        Log in
                      </span>{" "}
                      to check out faster.
                    </p>

                    <button
                      onClick={closeCart}
                      style={{
                        background: "#0D1B2A",
                        color: "#fff",
                        border: "none",
                        padding: "14px 34px",
                        borderRadius: 14,
                        fontSize: 16,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Continue shopping
                    </button>
                  </div>
                )}
              </m.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {addressOpen && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(10,15,22,0.6)",
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2147483648,
                padding: 16,
              }}
            >
              <m.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{
                  width: 360,
                  maxWidth: "92vw",
                  background: "#fff",
                  borderRadius: 28,
                  padding: "28px 28px 32px",
                  boxShadow: "0 30px 80px rgba(10,15,22,0.28)",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.35em",
                        color: GOLD,
                        marginBottom: 10,
                      }}
                    >
                      SECURE CHECKOUT
                    </div>

                    <h2
                      style={{
                        fontSize: 27,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        margin: 0,
                        color: "#111",
                        fontFamily: "'Bebas Neue', sans-serif",
                      }}
                    >
                      Delivery Address
                    </h2>
                  </div>

                  <button
                    onClick={closeAddressModal}
                    aria-label="Close delivery address form"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: "none",
                      background: "#f3f3f3",
                      cursor: "pointer",
                      fontSize: 18,
                      color: "#222",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* INPUTS — floating label treatment (visual only, same state/onChange) */}
                <FloatingInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <FloatingInput
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <FloatingInput
                  label="Complete Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <FloatingInput
                  label="Landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />

                {/* CITY + PINCODE */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: 12,
                    width: "100%",
                  }}
                >
                  <FloatingInput
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    noMargin
                  />
                  <FloatingInput
                    label="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    noMargin
                  />
                </div>

                {/* TOTAL */}
                <div
                  style={{
                    marginTop: 22,
                    background: "#F7F3EA",
                    borderRadius: 18,
                    padding: "18px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: `1px solid ${GOLD_SOFT}`,
                  }}
                >
                  <span style={{ fontSize: 17, color: "#222" }}>
                    Total Amount
                  </span>

                  <strong
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#111",
                    }}
                  >
                    ₹{cartTotal}
                  </strong>
                </div>

                {/* BUTTON */}
                <button
                  disabled={!isFormValid}
                  onClick={handlePlaceOrder}
                  style={{
                    width: "100%",
                    height: 56,
                    marginTop: 22,
                    border: "none",
                    borderRadius: 16,
                    background: isFormValid ? "#0D1B2A" : "#CFCFCF",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: ".02em",
                    cursor: isFormValid ? "pointer" : "not-allowed",
                    opacity: isFormValid ? 1 : 0.7,
                    boxShadow: isFormValid ? "0 14px 30px rgba(13,27,42,0.28)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                >
                  PLACE ORDER →
                </button>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>

        {/* PREMIUM FOOTER (expanded, replaces the old thin strip) — visual only,
            Instagram link + copyright text preserved */}
        <footer
          style={{
            background: NAVY,
           }}
        >
          <div
          style={{
            background: NAVY,
            padding: "28px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 22,
              letterSpacing: "0.3em",
              color: "#fff",
            }}
          >
            PRAKUMBH
          </div>

          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
            }}
          >
            © 2025 Prakumbh. India's Premium Streetwear.
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <a
              href="https://www.instagram.com/prakumbhclothing?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                transition: "color .25s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
              }
            >
              Instagram
            </a>
          </div>
        </div>

 
        </footer>

        {pageLoading && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10,15,22,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999999,
            }}
          >
            {/* branded loader — rotating gold seal ring instead of a plain spinner */}
<div
  style={{
    position: "relative",
    width: 150,
    height: 150,
  }}
>
  <div
    style={{
      position: "absolute",
      inset: 0,
      border: "5px solid rgba(212,175,55,0.2)",
      borderTop: `5px solid ${GOLD}`,
      borderRadius: "50%",
      animation: "spin 0.9s linear infinite",
    }}
  />
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <SealMark size={52} />
  </div>
</div>
          </div>
        )}
      </div>
    </LazyMotion>
    
  );
}

// ─── FOOTER HELPERS (new, presentational only) ───────────────────────────────
function FooterColumn({ title, links }) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#fff",
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map((label) => (
          <li key={label}>
            <span
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.55)",
                cursor: "pointer",
              }}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Floating-label input used only inside the address modal. Wraps the same
// value/onChange contract as a plain <input> — no state or validation logic
// added or removed.
function FloatingInput({ label, value, onChange, noMargin }) {
  return (
    <div style={{ position: "relative", marginBottom: noMargin ? 0 : 14 }}>
      <input
        placeholder=" "
        aria-label={label}
        value={value}
        onChange={onChange}
        className="floating-input"
        style={{
          width: "100%",
          height: 54,
          border: "1px solid #e7e7e7",
          borderRadius: 14,
          padding: "18px 16px 4px",
          fontSize: 15,
          outline: "none",
          background: "#fff",
        }}
      />
      <label
        style={{
          position: "absolute",
          left: 16,
          top: value ? 6 : 17,
          fontSize: value ? 11 : 15,
          color: value ? GOLD : "#999",
          transition: "all 0.15s ease",
          pointerEvents: "none",
        }}
      >
        {label}
      </label>
      <style>{`
        .floating-input:focus { border-color: ${GOLD} !important; }
      `}</style>
    </div>
  );
}