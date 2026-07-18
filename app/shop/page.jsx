'use client';
import { useCart } from "@/components/CartProvider";
import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { products, GOLD, NAVY, LIGHT, BORDER } from "../data/products";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
// NOTE: `handleBuyNow` was imported but never used anywhere in this file.
// Removing unused imports trims the JS bundle that has to be parsed/executed
// for this route (bundle-size + parse-time reduction, no visual change).

// ─── CONSTANTS (module scope — created once, not on every render) ───────────
const EASE = [0.16, 1, 0.3, 1];

// Warm off-white used in place of flat white for premium surfaces, matching
// the homepage's navy/gold direction. Kept as a fallback in case LIGHT is
// not exported with this value from data/products.
const CREAM = LIGHT || "#F8F4EA";

const MILITARY_CATEGORIES = [
  { id: "all", label: "All", image: "/assets/all.jpeg" },
  { id: "unfiltered", label: "UNTITLED", image: "/assets/unfilteredd.jpeg" },
  { id: "shivaji", label: "CREATIVE GRAPHICS", image: "/assets/fest.jpeg" },
  { id: "swarajya", label: "FESTIVALS", image: "/assets/gadkot.jpeg" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const PRICE_RANGES = [
  { label: "Under ₹499", min: 0, max: 499 },
  { label: "₹499 – ₹999", min: 499, max: 999 },
  { label: "₹999 – ₹1999", min: 999, max: 1999 },
  { label: "Above ₹1999", min: 1999, max: Infinity },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "New Arrivals" },
];

// Was previously declared *inside* ShopProductCard, meaning a brand-new array
// was allocated and an `.includes()` scan set up on every single render of
// every single product card. Hoisting it to module scope means it is
// allocated exactly once for the whole app lifetime.
const FRONT_ONLY_PRODUCTS = [
  "guardian-of-swarajya-new",
  "anant-shiv",
  "destined-for-glory",
  "dev-maza-raygadi",
  "punyashlok-ahilyadevi",
  "legacy-of-valor",
  "one-and-only",
  "roar",
  "sahyadricha-wagh",
  "the-unsurrendered",
  "unbroken-maratha",
  "war-in-my-veins",
  "warrior",
  "unstoppable",
  "flag-pride",
  "my-soul-my-king",
  "garza-maratha",
];
// O(1) lookup instead of O(n) Array#includes on every render of every card.
const FRONT_ONLY_SET = new Set(FRONT_ONLY_PRODUCTS);

const parsePrice = (str) =>
  Number((str || "0").replace(/[₹,.]/g, "").replace(".00", "")) || 0;

// Style objects that never depend on props/state — hoisted so they are not
// re-allocated (and don't cause child re-renders when passed down) on every
// parent render. Values updated to the premium navy/gold direction; the
// hoisting pattern itself (defined once, module scope) is unchanged.
const PREMIUM_INPUT_STYLE = {
  width: "100%",
  height: 56,
  border: "1px solid rgba(13,27,42,0.14)",
  borderRadius: 14,
  padding: "0 16px",
  fontSize: 15,
  outline: "none",
  background: CREAM,
  color: "#111",
  fontFamily: "'Barlow Condensed', sans-serif",
};

const ADDRESS_INPUT_STYLE = {
  width: "100%",
  height: 52,
  border: "1px solid rgba(13,27,42,0.14)",
  borderRadius: 14,
  padding: "0 16px",
  marginBottom: 14,
  fontSize: 15,
  outline: "none",
  background: "#fff",
  fontFamily: "'Barlow Condensed', sans-serif",
  color: "#111",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const CITY_PINCODE_INPUT_STYLE = {
  height: 52,
  border: "1px solid rgba(13,27,42,0.14)",
  borderRadius: 14,
  padding: "0 16px",
  fontSize: 15,
  outline: "none",
  fontFamily: "'Barlow Condensed', sans-serif",
  color: "#111",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

// Global page CSS as a static string — built once at module load instead of
// being reconstructed via template literal on every ShopPageContent render.
const PAGE_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: 'Barlow Condensed', sans-serif; background: #fff; overflow-x: hidden; -webkit-font-smoothing: antialiased; text-rendering: optimizeSpeed; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #ccc; }
button { outline: none; }
.group:hover .group-hover\\:w-full { width: 100% !important; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.category-scroll::-webkit-scrollbar { display: none; }

@media (max-width: 640px) {
  .shop-product-grid img { height: auto !important; max-height: 260px; object-fit: cover !important; }
  .category-scroll { flex-wrap: nowrap !important; justify-content: flex-start !important; padding-left: 2px; padding-right: 2px; }
}
* { -webkit-tap-highlight-color: transparent; }

/* RESPONSIVE PRODUCT GRID */
.shop-product-grid {
  grid-template-columns: repeat(5, 1fr);
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 1200px;
}
@media (max-width: 1200px) { .shop-product-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 900px)  { .shop-product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  {
  .shop-product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 18px !important; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* PREMIUM POLISH — additive only, none of the perf hooks above are touched */
.pk-address-input:focus, .pk-citypin-input:focus {
  border-color: ${GOLD} !important;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.18);
}
.pk-product-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); }
.pk-product-card:hover { transform: translateY(-4px); }
.pk-product-card:hover .pk-product-shadow { box-shadow: 0 18px 40px rgba(13,27,42,0.16); }
.pk-swatch { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.pk-swatch:hover { transform: scale(1.18); }
.pk-footer-link { transition: color 0.2s ease; }
.pk-sort-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

/* FILTER BAR — desktop row scrolls horizontally instead of wrapping, so it
   never breaks awkwardly at tablet / small-laptop widths. Fade hints on
   either edge signal there's more to scroll. */
.filterbar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
.filterbar-scroll::-webkit-scrollbar { display: none; }
`;

// ─── SHARED useIsMobile HOOK ──────────────────────────────────────────────
// Previously FOUR separate components (ShopPageContent, CartDrawer, ShopHero,
// FilterBar) each mounted their own `resize` listener that recalculated and
// called setState on *every single resize event* with no throttling. On
// devices that fire resize continuously (drag-resizing a browser window,
// some mobile keyboard show/hide events, orientation changes), that meant up
// to 4x redundant listeners and 4x redundant state updates + re-renders per
// event. This hook consolidates the pattern, throttles updates with
// requestAnimationFrame, and only calls setState when the boolean actually
// flips (no-op resize events no longer trigger a re-render at all).
function useIsMobile(breakpoint) {
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef(null);
  const lastValue = useRef(null);

  useEffect(() => {
    const check = () => {
      const next = window.innerWidth < breakpoint;
      if (next !== lastValue.current) {
        lastValue.current = next;
        setIsMobile(next);
      }
    };

    check();

    const handleResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        check();
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [breakpoint]);

  return isMobile;
}

// ─── SHARED useBreakpoint HOOK ────────────────────────────────────────────
// Three-way version of useIsMobile above. A hard mobile/desktop boolean at a
// single pixel value meant tablets and small laptops (roughly 640–1024px)
// always fell into whichever bucket the single breakpoint happened to land
// on, which produced awkward in-between layouts (a 720px hero on an iPad, a
// squeezed 4-column footer, etc). This adds an explicit "tablet" bucket so
// components can give that range its own sensible values instead of just
// inheriting the desktop layout. Same rAF-throttled, only-update-on-change
// pattern as useIsMobile.
function useBreakpoint() {
  const [bp, setBp] = useState("desktop");
  const rafRef = useRef(null);
  const lastValue = useRef(null);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const next = w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
      if (next !== lastValue.current) {
        lastValue.current = next;
        setBp(next);
      }
    };

    check();

    const handleResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        check();
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return bp; // "mobile" | "tablet" | "desktop"
}

// ─── SIGNATURE MARK ───────────────────────────────────────────────────────
// Small saffron "pennant" SVG — the recurring cross-page signature accent
// (referenced in the redesign brief) used next to eyebrows/labels and in the
// empty-state. Purely presentational, no props/state, so it's a plain
// module-level component — never re-allocated, never re-renders for reasons
// other than its own (nonexistent) inputs changing.
function PennantMark({ size = 14, color = GOLD }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 14 18" fill="none" aria-hidden="true">
      <path d="M1 1 L13 1 L13 13 L7 18 L1 13 Z" fill={color} />
    </svg>
  );
}

// ─── CART DRAWER (exact same visuals as homepage) ────────────────────────────
const CartDrawer = memo(function CartDrawer({
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
  cartTotal,
  addressOpen,
  setAddressOpen,
  customer,
  setCustomer,
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  // Stable handlers — created once, referenced by id/color/size inside so the
  // closures passed into JSX don't need to be redefined with new dependency
  // arrays per cart item.
  const incrementQty = useCallback(
    (item) => {
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.id === item.id &&
          ci.selectedColor === item.selectedColor &&
          ci.selectedSize === item.selectedSize
            ? { ...ci, quantity: (ci.quantity || 1) + 1 }
            : ci
        )
      );
    },
    [setCartItems]
  );

  const decrementQty = useCallback(
    (item) => {
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.id === item.id &&
          ci.selectedColor === item.selectedColor &&
          ci.selectedSize === item.selectedSize
            ? { ...ci, quantity: Math.max(1, (ci.quantity || 1) - 1) }
            : ci
        )
      );
    },
    [setCartItems]
  );

  const removeItem = useCallback(
    (item) => {
      setCartItems((prev) =>
        prev.filter(
          (ci) =>
            !(
              ci.id === item.id &&
              ci.selectedColor === item.selectedColor &&
              ci.selectedSize === item.selectedSize
            )
        )
      );
    },
    [setCartItems]
  );

  const closeCart = useCallback(() => setCartOpen(false), [setCartOpen]);
  const openAddress = useCallback(() => setAddressOpen(true), [setAddressOpen]);

  // `cartTotal` is now computed exactly once, in the parent (ShopPageContent),
  // and passed down as a prop — previously this exact reduce() over
  // `cartItems` ran a second time here AND a third time inside
  // handlePlaceOrder, all from the same source array. Removing the local
  // useMemo means one calculation instead of three per cartItems change.

  // Drawer width now scales across all three breakpoints instead of just
  // mobile/desktop: full-width sheet on phones, a slightly narrower panel on
  // tablets (380px felt tight against a tablet's own chrome/scrollbar), and
  // the original 380px on desktop.
  const drawerWidth = isMobile ? "100%" : bp === "tablet" ? 340 : 380;

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(13,27,42,0.55)",
              zIndex: 2147483646,
            }}
          />
          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: drawerWidth,
              maxWidth: "100%",
              height: "100dvh",
              background: CREAM,
              zIndex: 2147483647,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-12px 0 40px rgba(13,27,42,0.18)",
            }}
          >
            {/* HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PennantMark size={12} />
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: NAVY,
                    fontWeight: 700,
                  }}
                >
                  Your Bag
                </span>
              </div>
              {/* CLOSE */}
              <button
                onClick={closeCart}
                aria-label="Close cart"
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 32,
                  cursor: "pointer",
                  lineHeight: 1,
                  color: NAVY,
                }}
              >
                ×
              </button>
            </div>

            {cartItems.length > 0 ? (
              <>
                <div
                  style={{
                    marginTop: 22,
                    overflowY: "auto",
                    flex: 1,
                    minHeight: 0,
                    paddingBottom: 20,
                  }}
                >
                  {cartItems.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        paddingBottom: 24,
                        marginBottom: 24,
                        borderBottom: "1px solid rgba(13,27,42,0.1)",
                      }}
                    >
                      <div
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          padding: 6,
                          boxShadow: "0 2px 8px rgba(13,27,42,0.08)",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={
                            item.image ||
                            item.images?.[item.selectedColor || item.defaultColor || "black"]?.back
                          }
                          alt={item.name}
                          width={110}
                          height={140}
                          loading="lazy"
                          decoding="async"
                          style={{
                            width: 98,
                            height: 128,
                            objectFit: "contain",
                            background: "transparent",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: 16,
                            lineHeight: 1.4,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            color: NAVY,
                            marginBottom: 8,
                          }}
                        >
                          {item.name}
                        </h4>
                        <p style={{ fontSize: 15, color: "#7a7a7a", marginBottom: 14 }}>
                          {item.selectedColor || "Black"} · {item.selectedSize || "M"}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                          }}
                        >
                          <span style={{ fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "'Oswald', sans-serif" }}>
                            {item.price}
                          </span>

                          {item.oldPrice && (
                            <span
                              style={{
                                fontSize: 13,
                                color: "#b3b3b3",
                                textDecoration: "line-through",
                              }}
                            >
                              {item.oldPrice}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              border: `1px solid rgba(13,27,42,0.14)`,
                              borderRadius: 8,
                              overflow: "hidden",
                              height: 44,
                              background: "#fff",
                            }}
                          >
                            <button
                              onClick={() => decrementQty(item)}
                              aria-label="Decrease quantity"
                              style={{
                                width: 40,
                                height: "100%",
                                border: "none",
                                background: "transparent",
                                fontSize: 20,
                                cursor: "pointer",
                                color: NAVY,
                              }}
                            >
                              −
                            </button>

                            <div
                              style={{
                                width: 36,
                                textAlign: "center",
                                fontSize: 15,
                                color: NAVY,
                                fontWeight: 600,
                              }}
                            >
                              {item.quantity || 1}
                            </div>

                            <button
                              onClick={() => incrementQty(item)}
                              aria-label="Increase quantity"
                              style={{
                                width: 40,
                                height: "100%",
                                border: "none",
                                background: "transparent",
                                fontSize: 20,
                                cursor: "pointer",
                                color: NAVY,
                              }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item)}
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
                            <span className="material-symbols-outlined" style={{ color: "#8a8a8a" }}>
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    borderTop: `1px solid rgba(13,27,42,0.12)`,
                    paddingTop: 24,
                    marginTop: 0,
                    position: "sticky",
                    bottom: 0,
                    background: CREAM,
                    zIndex: 50,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 15, color: "#666", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Estimated total
                    </span>

                    <span style={{ fontSize: 26, fontWeight: 700, color: NAVY, lineHeight: 1, fontFamily: "'Oswald', sans-serif" }}>
                      ₹{cartTotal}.00
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: "#999", marginBottom: 16, lineHeight: 1.5 }}>
                    Duties and taxes included. Shipping calculated at checkout.
                  </p>

                  <button
                    onClick={openAddress}
                    style={{
                      width: "100%",
                      height: 58,
                      border: "none",
                      background: NAVY,
                      borderRadius: 14,
                      fontSize: 17,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      color: "#fff",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      boxShadow: "0 10px 26px rgba(13,27,42,0.28)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 14px 32px rgba(13,27,42,0.34)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 26px rgba(13,27,42,0.28)";
                    }}
                  >
                    Buy Now →
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  paddingBottom: 40,
                  marginTop: 60,
                }}
              >
                <PennantMark size={22} />
                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: isMobile ? 31 : 38,
                    fontWeight: 700,
                    color: NAVY,
                    marginTop: 18,
                    marginBottom: 14,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Your cart is empty
                </h2>

                <p
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 16,
                    color: "#555",
                    marginBottom: 34,
                    lineHeight: 1.5,
                  }}
                >
                  Have an account?{" "}
                  <span style={{ textDecoration: "underline", cursor: "pointer", color: NAVY }}>Log in</span>{" "}
                  to check out faster.
                </p>

                <button
                  onClick={closeCart}
                  style={{
                    border: "none",
                    background: NAVY,
                    color: "#fff",
                    height: 50,
                    minWidth: 195,
                    padding: "0 34px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ─── SHOP HERO ────────────────────────────────────────────────────────────
// Memoized + no longer receives (and re-renders on) activeCategory /
// setActiveCategory, which it never used in its own markup. Previously this
// component re-rendered every time the user picked a different category,
// even though its visual output never changes because of that.
//
// Height now has an explicit tablet value instead of jumping straight from
// 220px (mobile) to 720px (desktop) — on an iPad-sized viewport 720px was
// disproportionately tall relative to the viewport, pushing all real
// content (categories, filters, products) far below the fold.
const ShopHero = memo(function ShopHero() {
  const bp = useBreakpoint();
  const height = bp === "mobile" ? 220 : bp === "tablet" ? 400 : 720;

  return (
    <section
      style={{
        position: "relative",
        height,
        overflow: "hidden",
        background: "#060d18",
      }}
    >
      {/* BG IMAGE — exact same height/background logic per breakpoint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/shopPage.webp')",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#060d18",
          filter: "brightness(0.92)",
          backgroundSize: "cover",
          backgroundPosition: bp === "mobile" ? "center center" : "center 35%",
        }}
      />

      {/* GRADIENT OVERLAY — additive, purely presentational */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(6,13,24,0.25) 0%, rgba(6,13,24,0.15) 40%, rgba(6,13,24,0.75) 100%)",
        }}
      />

      {/* COPY OVERLAY */}
 
    </section>
  );
});

// ─── CATEGORY CIRCLES ─────────────────────────────────────────────────────
const CategorySection = memo(function CategorySection({ activeCategory, setActiveCategory, setPageLoading }) {
  // Single stable handler reused by every button via a data-attribute instead
  // of a brand-new arrow-function closure being created per category per
  // render.
  const handleCategoryClick = useCallback(
    (e) => {
      const catId = e.currentTarget.dataset.catId;
      setPageLoading(true);
      setTimeout(() => {
        setActiveCategory(catId);
        setTimeout(() => setPageLoading(false), 300);
      }, 50);
    },
    [setActiveCategory, setPageLoading]
  );

  return (
    <section style={{ background: "#fff", padding: "28px clamp(16px,4vw,48px) 6px", overflowX: "auto" }}>
      <div
        className="category-scroll"
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 8,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {MILITARY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            data-cat-id={cat.id}
            onClick={handleCategoryClick}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              background: "none",
              border: "none",
              cursor: "pointer",
              minWidth: 92,
              flexShrink: 0,
              padding: "6px 4px",
            }}
          >
            {/* whileHover/whileTap replace the previous manual inline
                onMouseEnter/onMouseLeave DOM mutation — same equivalent
                behavior (scale + background shift on non-active circles),
                driven declaratively instead. */}
            <motion.div
              whileHover={activeCategory === cat.id ? {} : { scale: 1.07 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: activeCategory === cat.id ? NAVY : CREAM,
                border: `2px solid ${activeCategory === cat.id ? GOLD : "transparent"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow:
                  activeCategory === cat.id
                    ? `0 8px 24px rgba(13,27,42,0.32)`
                    : "0 2px 8px rgba(13,27,42,0.06)",
                transform: activeCategory === cat.id ? "scale(1.08)" : "scale(1)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="72px"
                  loading="lazy"
                  decoding="async"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </motion.div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                marginTop: 4,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: activeCategory === cat.id ? NAVY : "#888",
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 76,
                transition: "color 0.2s",
              }}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
});

// ─── FILTER BAR ───────────────────────────────────────────────────────────
// const FilterBar = memo(function FilterBar({ filters, setFilters, sort, setSort, totalCount, filteredCount }) {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
//   const isMobile = useIsMobile(768);
//   const ref = useRef(null);

//   // `useRouter()` was called here previously but `router` was never actually
//   // referenced anywhere in this component — an unused hook subscription that
//   // could cause pointless re-renders on route/query changes. Removed.

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpenDropdown(null);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const toggleSize = useCallback(
//     (sz) => {
//       setFilters((f) => ({
//         ...f,
//         sizes: f.sizes.includes(sz) ? f.sizes.filter((s) => s !== sz) : [...f.sizes, sz],
//       }));
//     },
//     [setFilters]
//   );

//   const togglePrice = useCallback(
//     (range) => {
//       setFilters((f) => ({
//         ...f,
//         priceRange: f.priceRange === range.label ? null : range.label,
//       }));
//     },
//     [setFilters]
//   );

//   const clearAll = useCallback(
//     () => setFilters({ sizes: [], priceRange: null, inStock: false }),
//     [setFilters]
//   );

//   const closeMobileFilter = useCallback(() => setMobileFilterOpen(false), []);
//   const openMobileFilter = useCallback(() => setMobileFilterOpen(true), []);

//   const hasFilters = filters.sizes.length > 0 || filters.priceRange || filters.inStock;

//   // Shared chip styling helper — presentational only, no new state.
//   const chipStyle = (active) => ({
//     height: 38,
//     padding: "0 16px",
//     borderRadius: 999,
//     fontSize: 13,
//     fontFamily: "'Barlow Condensed', sans-serif",
//     fontWeight: 600,
//     letterSpacing: "0.03em",
//     cursor: "pointer",
//     border: active ? `1.5px solid ${NAVY}` : "1px solid rgba(13,27,42,0.16)",
//     background: active ? NAVY : "#fff",
//     color: active ? "#fff" : "#333",
//     transition: "all 0.18s ease",
//     whiteSpace: "nowrap",
//   });

//   return (
//     <div
//       ref={ref}
//       style={{
//         position: "sticky",
//         top: 56,
//         zIndex: 200,
//         background: "#fff",
//         borderBottom: `1px solid ${BORDER}`,
//         willChange: "transform",
//         transform: "translateZ(0)",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: 1700,
//           margin: "0 auto",
//           display: "flex",
//           alignItems: "center",
//           gap: 10,
//           flexWrap: "wrap",
//           padding: isMobile ? "10px clamp(16px,4vw,48px)" : "16px clamp(16px,4vw,48px)",
//         }}
//       >
//         {isMobile ? (
//           <>
//             {/* MOBILE TRIGGER — opens the exact same drawer as before */}
//             <button
//               onClick={openMobileFilter}
//               aria-label="Open filters"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 height: 38,
//                 padding: "0 16px",
//                 borderRadius: 999,
//                 border: `1px solid rgba(13,27,42,0.16)`,
//                 background: hasFilters ? NAVY : "#fff",
//                 color: hasFilters ? "#fff" : NAVY,
//                 fontSize: 13,
//                 fontFamily: "'Barlow Condensed', sans-serif",
//                 fontWeight: 700,
//                 letterSpacing: "0.06em",
//                 textTransform: "uppercase",
//                 cursor: "pointer",
//               }}
//             >
//               <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
//                 tune
//               </span>
//               Filter{hasFilters ? ` (${filters.sizes.length + (filters.priceRange ? 1 : 0) + (filters.inStock ? 1 : 0)})` : ""}
//             </button>

//             <AnimatePresence>
//               {mobileFilterOpen && (
//                 <>
//                   <div
//                     onClick={closeMobileFilter}
//                     style={{
//                       position: "fixed",
//                       inset: 0,
//                       background: "rgba(13,27,42,0.55)",
//                       zIndex: 999999,
//                     }}
//                   />

//                   <div
//                     style={{
//                       position: "fixed",
//                       top: 0,
//                       left: 0,
//                       width: "92%",
//                       maxWidth: 360,
//                       height: "100dvh",
//                       background: "#fff",
//                       zIndex: 9999999,
//                       overflowY: "auto",
//                       padding: "20px 18px 120px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         marginBottom: 28,
//                       }}
//                     >
//                       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                         <PennantMark size={14} />
//                         <h2 style={{ fontSize: 22, color: NAVY, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em" }}>
//                           Filter
//                         </h2>
//                       </div>

//                       <button
//                         onClick={closeMobileFilter}
//                         aria-label="Close filters"
//                         style={{
//                           border: "none",
//                           background: "transparent",
//                           fontSize: 34,
//                           cursor: "pointer",
//                           color: NAVY,
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>

//                     {/* AVAILABILITY */}
//                     <div
//                       style={{
//                         paddingBottom: 24,
//                         borderBottom: "1px solid rgba(13,27,42,0.1)",
//                         marginBottom: 24,
//                       }}
//                     >
//                       <h3 style={{ fontSize: 12, marginBottom: 18, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Availability</h3>

//                       <label
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: 12,
//                           marginBottom: 16,
//                           fontSize: 16,
//                           color: "#444",
//                         }}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={filters.inStock}
//                           onChange={(e) =>
//                             setFilters((f) => ({ ...f, inStock: e.target.checked }))
//                           }
//                           style={{ width: 22, height: 22, accentColor: NAVY }}
//                         />
//                         In stock
//                       </label>
//                     </div>

//                     {/* SIZE */}
//                     <div
//                       style={{
//                         paddingBottom: 24,
//                         borderBottom: "1px solid rgba(13,27,42,0.1)",
//                         marginBottom: 24,
//                       }}
//                     >
//                       <h3 style={{ fontSize: 12, marginBottom: 18, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Size</h3>

//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: "repeat(4,1fr)",
//                           gap: 12,
//                         }}
//                       >
//                         {SIZES.map((sz) => (
//                           <button
//                             key={sz}
//                             onClick={() => toggleSize(sz)}
//                             style={{
//                               height: 44,
//                               border: filters.sizes.includes(sz)
//                                 ? `1.5px solid ${NAVY}`
//                                 : "1px solid rgba(13,27,42,0.16)",
//                               background: filters.sizes.includes(sz) ? NAVY : "#fff",
//                               color: filters.sizes.includes(sz) ? "#fff" : "#333",
//                               borderRadius: 12,
//                               fontSize: 15,
//                               cursor: "pointer",
//                               fontFamily: "'Barlow Condensed', sans-serif",
//                               fontWeight: 600,
//                             }}
//                           >
//                             {sz}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* PRICE — now wired for mobile too, reusing togglePrice */}
//                     <div
//                       style={{
//                         paddingBottom: 24,
//                         borderBottom: "1px solid rgba(13,27,42,0.1)",
//                         marginBottom: 24,
//                       }}
//                     >
//                       <h3 style={{ fontSize: 12, marginBottom: 18, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Price</h3>
//                       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                         {PRICE_RANGES.map((range) => (
//                           <button
//                             key={range.label}
//                             onClick={() => togglePrice(range)}
//                             style={{
//                               ...chipStyle(filters.priceRange === range.label),
//                               width: "100%",
//                               textAlign: "left",
//                               height: 44,
//                             }}
//                           >
//                             {range.label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* SORT */}
//                     <div style={{ marginBottom: 28 }}>
//                       <h3 style={{ fontSize: 12, marginBottom: 18, color: "#888", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Sort</h3>

//                       <select
//                         value={sort}
//                         onChange={(e) => setSort(e.target.value)}
//                         style={{
//                           width: "100%",
//                           height: 52,
//                           border: "1px solid rgba(13,27,42,0.16)",
//                           borderRadius: 12,
//                           padding: "0 14px",
//                           fontSize: 15,
//                           background: "#fff",
//                           fontFamily: "'Barlow Condensed', sans-serif",
//                         }}
//                       >
//                         {SORT_OPTIONS.map((o) => (
//                           <option key={o.value} value={o.value}>
//                             {o.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     {hasFilters && (
//                       <button
//                         onClick={clearAll}
//                         style={{
//                           border: "none",
//                           background: "transparent",
//                           color: "#888",
//                           fontSize: 13,
//                           textDecoration: "underline",
//                           cursor: "pointer",
//                           marginBottom: 12,
//                           fontFamily: "'Barlow Condensed', sans-serif",
//                         }}
//                       >
//                         Clear all
//                       </button>
//                     )}

//                     {/* BUTTON */}
//                     <button
//                       onClick={closeMobileFilter}
//                       style={{
//                         position: "fixed",
//                         left: 30,
//                         right: 30,
//                         bottom: 22,
//                         height: 54,
//                         borderRadius: 14,
//                         border: "none",
//                         background: NAVY,
//                         color: "#fff",
//                         fontSize: 16,
//                         fontWeight: 700,
//                         cursor: "pointer",
//                         letterSpacing: "0.06em",
//                         textTransform: "uppercase",
//                         boxShadow: "0 10px 26px rgba(13,27,42,0.28)",
//                       }}
//                     >
//                       See {filteredCount} items
//                     </button>
//                   </div>
//                 </>
//               )}
//             </AnimatePresence>
//           </>
//         ) : (
//           // ── DESKTOP FILTER ROW ──────────────────────────────────────────
//           // Previously used flexWrap: "wrap", which meant at intermediate
//           // widths (tablets, small laptops, or a browser window resized
//           // between 768–1300px) the chips would break into an unpredictable,
//           // uneven second/third row. Now the row scrolls horizontally
//           // instead of wrapping — same pattern as the category circles above
//           // — so it looks intentional and consistent at every width instead
//           // of "breaking" at certain sizes. Nothing about the filter logic
//           // changed, only the container's overflow behavior.
//           <div style={{ position: "relative", width: "100%", minWidth: 0 }}>
//             <div
//               className="filterbar-scroll"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 22,
//                 flexWrap: "nowrap",
//                 overflowX: "auto",
//                 overflowY: "hidden",
//                 width: "100%",
//                 scrollBehavior: "smooth",
//                 WebkitOverflowScrolling: "touch",
//               }}
//             >
//               {/* SORT DROPDOWN */}
//               <div style={{ position: "relative", flexShrink: 0 }}>
//                 <select
//                   value={sort}
//                   onChange={(e) => setSort(e.target.value)}
//                   className="pk-sort-select"
//                   aria-label="Sort products"
//                   style={{
//                     height: 40,
//                     padding: "0 34px 0 16px",
//                     borderRadius: 10,
//                     border: `1px solid rgba(13,27,42,0.16)`,
//                     background: "#fff",
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: NAVY,
//                     fontFamily: "'Barlow Condensed', sans-serif",
//                     cursor: "pointer",
//                   }}
//                 >
//                   {SORT_OPTIONS.map((o) => (
//                     <option key={o.value} value={o.value}>
//                       {o.label}
//                     </option>
//                   ))}
//                 </select>
//                 <span
//                   className="material-symbols-outlined"
//                   style={{
//                     position: "absolute",
//                     right: 10,
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     fontSize: 18,
//                     color: NAVY,
//                     pointerEvents: "none",
//                   }}
//                 >
//                   expand_more
//                 </span>
//               </div>

//               <div style={{ width: 1, height: 24, background: "rgba(13,27,42,0.12)", flexShrink: 0 }} />

//               {/* SIZE CHIPS */}
//               <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//                 <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginRight: 2, flexShrink: 0 }}>
//                   Size
//                 </span>
//                 {SIZES.map((sz) => (
//                   <button
//                     key={sz}
//                     onClick={() => toggleSize(sz)}
//                     style={{ ...chipStyle(filters.sizes.includes(sz)), height: 34, padding: "0 13px", fontSize: 12, flexShrink: 0 }}
//                   >
//                     {sz}
//                   </button>
//                 ))}
//               </div>

//               <div style={{ width: 1, height: 24, background: "rgba(13,27,42,0.12)", flexShrink: 0 }} />

//               {/* PRICE CHIPS */}
//               <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//                 <span style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginRight: 2, flexShrink: 0 }}>
//                   Price
//                 </span>
//                 {PRICE_RANGES.map((range) => (
//                   <button
//                     key={range.label}
//                     onClick={() => togglePrice(range)}
//                     style={{ ...chipStyle(filters.priceRange === range.label), height: 34, fontSize: 12, flexShrink: 0 }}
//                   >
//                     {range.label}
//                   </button>
//                 ))}
//               </div>

//               <div style={{ width: 1, height: 24, background: "rgba(13,27,42,0.12)", flexShrink: 0 }} />

//               {/* IN STOCK */}
//               <button
//                 onClick={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
//                 style={{ ...chipStyle(filters.inStock), height: 34, fontSize: 12, flexShrink: 0 }}
//               >
//                 In stock only
//               </button>

//               {hasFilters && (
//                 <button
//                   onClick={clearAll}
//                   style={{
//                     flexShrink: 0,
//                     border: "none",
//                     background: "transparent",
//                     color: "#888",
//                     fontSize: 12,
//                     textDecoration: "underline",
//                     cursor: "pointer",
//                     fontFamily: "'Barlow Condensed', sans-serif",
//                     fontWeight: 600,
//                     letterSpacing: "0.03em",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Clear all
//                 </button>
//               )}
//             </div>

//             {/* Right-edge fade — subtle hint that the row scrolls further.
//                 Pointer-events none so it never blocks clicks on the last chip. */}
//             <div
//               aria-hidden="true"
//               style={{
//                 position: "absolute",
//                 right: 0,
//                 top: 0,
//                 bottom: 0,
//                 width: 36,
//                 background: "linear-gradient(90deg, rgba(255,255,255,0), #fff)",
//                 pointerEvents: "none",
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────
const ShopProductCard = memo(
  function ShopProductCard({ product, setCartOpen, setCartItems, setPageLoading }) {
    const router = useRouter();
    const [selectedColor, setSelectedColor] = useState(product.defaultColor || "black");

    const imageSrc = FRONT_ONLY_SET.has(product.id)
      ? product.images?.[selectedColor]?.front
      : product.images?.[selectedColor]?.back;

    const discount = product.oldPrice
      ? Math.round(
          ((parsePrice(product.oldPrice) - parsePrice(product.price)) / parsePrice(product.oldPrice)) * 100
        )
      : 0;

    const handleCardClick = useCallback(() => {
      setPageLoading(true);
      router.push(`/product/${product.id}`);
    }, [setPageLoading, router, product.id]);

    // Prefetch the product route as soon as intent is likely (hover on
    // desktop, touchstart on mobile) instead of waiting for the click. This
    // uses Next.js's built-in client-side route cache, so navigation feels
    // instant without any change to the visual behavior of the card.
    const handlePrefetch = useCallback(() => {
      router.prefetch(`/product/${product.id}`);
    }, [router, product.id]);

    return (
      <div
        className="pk-product-card"
        onClick={handleCardClick}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        style={{ cursor: "pointer" }}
      >
        {/* IMAGE WRAP */}
        <div
          className="pk-product-shadow"
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 1px 4px rgba(13,27,42,0.06)",
            marginBottom: 14,
            transition: "box-shadow 0.35s ease",
          }}
        >
          {/* DISCOUNT BADGE — value already computed above, simply rendered now */}
          {discount > 0 && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 2,
                background: NAVY,
                color: GOLD,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "4px 9px",
                borderRadius: 999,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              −{discount}%
            </div>
          )}

          {/* IMAGE */}
<Image
  src={imageSrc}
  alt={product.name}
  width={320}
  height={400}
  loading="lazy"
  decoding="async"
  fetchPriority="low"
  quality={40}
  placeholder="empty"
  sizes="(max-width:640px) 50vw,
         (max-width:1024px) 33vw,
         20vw"
  style={{
    width: "100%",
    height: "auto",
    objectFit: "cover",
    aspectRatio: "4 / 5",
  }}
/>
        </div>

        {/* INFO */}
        <div>
          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.03em",
              color: "#111",
              marginBottom: 6,
              lineHeight: 1.3,
              textTransform: "uppercase",
            }}
          >
            {product.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span
              style={{
                fontSize: "clamp(14px,1.8vw,18px)",
                fontWeight: 700,
                color: "#111",
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              {product.price}
            </span>
            {product.oldPrice && (
              <span style={{ fontSize: "clamp(12px,1.4vw,14px)", color: "#bbb", textDecoration: "line-through" }}>
                {product.oldPrice}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {Object.keys(product.images || {}).map((colorKey, i) => (
              <div
                key={i}
                className="pk-swatch"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(colorKey);
                }}
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
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    colorKey === "black"
                      ? "#111"
                      : colorKey === "blue"
                      ? "#2563EB"
                      : colorKey === "pink"
                      ? "#B04A7A"
                      : colorKey === "green"
                      ? "#8A9A5B"
                      : colorKey === "grey"
                      ? "#6B7280"
                      : "#F5F5F5",
                  boxShadow:
                    selectedColor === colorKey
                      ? `0 0 0 2px #fff, 0 0 0 3.5px ${NAVY}`
                      : colorKey === "white"
                      ? "0 0 0 1px #ccc inset"
                      : "0 0 0 1px #dcdcdc inset",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => prev.product.id === next.product.id
);

// ─── PRODUCT GRID ─────────────────────────────────────────────────────────
// Previously wrapped in `dynamic(() => Promise.resolve(memo(...)))`. Since
// the component is already defined inline (not imported from a separate
// module), `Promise.resolve()` resolves synchronously on the *same* tick —
// there is no code-splitting benefit whatsoever. All it added was: (1) an
// extra dynamic-import runtime wrapper shipped in the bundle, (2) a
// suspense/loading branch that had to be checked on every render, and (3) a
// harder-to-optimize component boundary for React/webpack. A plain
// module-level `memo()` component gives identical behavior with less
// overhead. (content-visibility + contain in the CSS already give
// browser-level "virtualization" of offscreen rows, which is the right
// low-risk choice here versus swapping in a real windowing library that
// would change the DOM structure.)
const ProductGrid = memo(function ProductGrid({ products: list, setCartOpen, setCartItems, setPageLoading }) {
  if (list.length === 0) {
    return (
      <div style={{ padding: "90px 0", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <PennantMark size={34} />
        </div>
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 34,
            color: NAVY,
            marginBottom: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          No products found
        </h3>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            color: "#999",
            letterSpacing: "0.02em",
          }}
        >
          Try adjusting your filters or browse all categories.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "clamp(16px,2vw,28px)",
      }}
      className="shop-product-grid"
    >
      {list.map((p) => (
        <ShopProductCard
          key={p.id}
          product={p}
          setCartOpen={setCartOpen}
          setCartItems={setCartItems}
          setPageLoading={setPageLoading}
        />
      ))}
    </div>
  );
});

// ─── ROOT PAGE ────────────────────────────────────────────────────────────
function ShopPageContent() {
  const [addressOpen, setAddressOpen] = useState(false);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const { cartOpen, setCartOpen, cartItems, setCartItems } = useCart();

  const [barHidden, setBarHidden] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Memoized: on every keystroke in ANY of the six address fields, this used
  // to re-run five `.trim()` calls even though only one field actually
  // changed. Trivial cost individually, but it's recomputed on every render
  // of a component whose whole job during checkout is "respond to
  // keystrokes instantly" — worth eliminating.
  const isFormValid = useMemo(
    () =>
      Boolean(
        fullName.trim() && phone.trim() && address.trim() && city.trim() && pincode.trim()
      ),
    [fullName, phone, address, city, pincode]
  );

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  // FILTER STATE
  const [activeCategory, setActiveCategory] = useState("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    setPageLoading(false);
  }, [searchParams]);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) setActiveCategory(category);
  }, [searchParams]);

  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState({ sizes: [], priceRange: null, inStock: false });
  const [visibleProducts, setVisibleProducts] = useState(12);
  const lastHidden = useRef(false);

  // SCROLL LISTENER — already rAF-throttled and only calls setState when the
  // boolean actually changes (kept as-is: this was already correctly
  // optimized in the original code).
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const hidden = window.scrollY > 40;
        if (hidden !== lastHidden.current) {
          lastHidden.current = hidden;
          setBarHidden(hidden);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // FILTERED + SORTED PRODUCTS (unchanged logic, still memoized on the same
  // dependencies as before)
  const displayProducts = useMemo(() => {
    let list = [...products];

    if (activeCategory === "unfiltered") {
      list = list.filter((p) => p.id === "swami-samarth");
    } else if (activeCategory === "shivaji") {
      list = list.filter((p) => p.id !== "swami-samarth" && p.id !== "blazing-mavala");
    } else if (activeCategory !== "all") {
      list = list.filter(
        (p) =>
          (p.category || "").toLowerCase().includes(activeCategory) ||
          (p.tag || "").toLowerCase().includes(activeCategory)
      );
    }

    if (filters.priceRange) {
      const range = PRICE_RANGES.find((r) => r.label === filters.priceRange);
      if (range) {
        list = list.filter((p) => {
          const price = parsePrice(p.price);
          return price >= range.min && price <= range.max;
        });
      }
    }

    if (filters.sizes.length > 0) {
      list = list.filter((p) => !p.sizes || filters.sizes.some((s) => (p.sizes || SIZES).includes(s)));
    }

    if (filters.inStock) {
      list = list.filter((p) => p.inStock !== false);
    }

    if (sort === "price_asc") list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sort === "price_desc") list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sort === "newest") list = list.slice().reverse();

    return list;
  }, [activeCategory, sort, filters]);


  const displayedProducts = useMemo(
  () => displayProducts.slice(0, visibleProducts),
  [displayProducts, visibleProducts]
);
  // Cart total AND quantity — each computed exactly once whenever cartItems
  // changes, then shared by CartDrawer, the address modal, and
  // handlePlaceOrder's order payload. Previously the same reduce() over
  // cartItems ran up to FOUR separate times per render (once in CartDrawer,
  // once for the address-modal total, and twice more inside
  // handlePlaceOrder for `total` and `amount`).
  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price.replace("₹", "").replace(".00", "")) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const cartQuantity = useMemo(
    () => cartItems.reduce((t, i) => t + (i.quantity || 1), 0),
    [cartItems]
  );

  const closeAddressModal = useCallback(() => setAddressOpen(false), []);

  // Named async function with proper error handling instead of a bare
  // `.catch(console.error)` tacked onto a fire-and-forget promise chain.
  const sendOrderToAppsScript = useCallback(async (orderPayload) => {
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxYG8KeTKrt2sLhhrCyJ52m0E5XWUTzZYsYcmObNoDJm5q_ol_jXv_1XIM-lnTo-YsrLg/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
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

    // Guarded localStorage access — corrupted/missing data (e.g. a user who
    // cleared storage mid-session, or a previous version writing a bad
    // shape) no longer throws and blocks checkout.
    try {
      const currentUser = JSON.parse(localStorage.getItem("prakumbh_current") || "null");

      if (currentUser) {
        const users = JSON.parse(localStorage.getItem("prakumbh_users") || "[]");
        const userIndex = users.findIndex((u) => u.id === currentUser.id);

        if (userIndex !== -1) {
          const orderData = {
            id: "ORD" + Date.now(),
            date: new Date().toISOString(),
            status: "Processing",
            items: cartItems.map((item) => ({
              ...item,
              image: item.images?.[item.selectedColor || item.defaultColor || "black"]?.back || "",
            })),
            total: cartTotal,
            shippingAddress: { name: fullName, phone, address, landmark, city, pincode },
          };

          if (!users[userIndex].orders) users[userIndex].orders = [];
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
        .map((item) => `${item.name} | Color: ${item.selectedColor} | Size: ${item.selectedSize}`)
        .join(" || "),
      quantity: cartQuantity,
      amount: cartTotal,
    };

    const whatsappUrl = `https://wa.me/918766599895?text=${encodeURIComponent(message)}`;
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
    <>
      <style>{PAGE_STYLES}</style>

      <AnnouncementBar hidden={barHidden} />
      <Navbar barHidden={barHidden} setCartOpen={setCartOpen} cartItems={cartItems} />

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartTotal={cartTotal}
        addressOpen={addressOpen}
        setAddressOpen={setAddressOpen}
        customer={customer}
        setCustomer={setCustomer}
      />

      {/* PAGE BODY */}
      <div style={{ paddingTop: barHidden ? 58 : 94 }}>
        {/* 1. HERO */}
        <ShopHero />

        {/* 2. CATEGORY CIRCLES */}
        <CategorySection
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          setPageLoading={setPageLoading}
        />

        {/* 3. FILTER BAR
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          totalCount={products.length}
          filteredCount={displayProducts.length}
        /> */}

        {/* 4. PRODUCTS + BANNER */}
        <div style={{ maxWidth: 1700, margin: "0 auto", padding: "28px clamp(16px,4vw,48px) 80px" }}>
          {/* SECTION HEADING */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}
          >
            <PennantMark size={12} />
            <div style={{ width: 30, height: 2, background: GOLD }} />
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#888",
                fontWeight: 700,
              }}
            >
              {activeCategory === "all"
                ? "All Products"
                : MILITARY_CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </div>
            <div style={{ flex: 1, height: 1, background: "#EBEBEB" }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#bbb" }}>
              {displayProducts.length} items
            </div>
          </motion.div>

          {/* GRID */}
<ProductGrid
  products={displayedProducts}
  setCartOpen={setCartOpen}
  setCartItems={setCartItems}
  setPageLoading={setPageLoading}
/>

{visibleProducts < displayProducts.length && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      marginTop: 50,
    }}
  >
    <button
      onClick={() => setVisibleProducts((v) => v + 12)}
      style={{
        padding: "14px 32px",
        background: NAVY,
        color: "#fff",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 16,
        fontWeight: 600,
      }}
    >
      Load More
    </button>
  </div>
)}
        </div>

        {/* FOOTER — column count now scales across all three breakpoints:
            1 column on mobile, 2 on tablet (previously tablet fell into the
            desktop 4-column layout and squeezed every column too narrow to
            read comfortably), 4 on desktop. */}
        <footer style={{ background: NAVY }}>
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
      </div>

      {pageLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading page"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,27,42,0.35)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999999,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 10px 30px rgba(13,27,42,0.25)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                border: `3px solid rgba(13,27,42,0.14)`,
                borderTop: `3px solid ${GOLD}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        </div>
      )}

      {addressOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(13,27,42,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483648,
            padding: 16,
          }}
        >
          <div
            style={{
              width: 380,
              maxWidth: "92vw",
              background: "#fff",
              borderRadius: 24,
              padding: "28px 28px 32px",
              boxShadow: "0 24px 70px rgba(13,27,42,0.28)",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <PennantMark size={10} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.3em",
                      color: GOLD,
                      textTransform: "uppercase",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    Secure Checkout
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    margin: 0,
                    color: NAVY,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  Delivery Address
                </h2>
              </div>

              <button
                onClick={closeAddressModal}
                aria-label="Close delivery address form"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: CREAM,
                  cursor: "pointer",
                  fontSize: 18,
                  color: NAVY,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* INPUTS */}
            <input
              placeholder="Full Name"
              aria-label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
              className="pk-address-input"
            />

            <input
              placeholder="Phone Number"
              aria-label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
              className="pk-address-input"
            />

            <input
              placeholder="Complete Address"
              aria-label="Complete Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
              className="pk-address-input"
            />
            <input
              placeholder="Landmark"
              aria-label="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
              className="pk-address-input"
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
              <input
                placeholder="City"
                aria-label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={CITY_PINCODE_INPUT_STYLE}
                className="pk-citypin-input"
              />
              <input
                placeholder="Pincode"
                aria-label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={CITY_PINCODE_INPUT_STYLE}
                className="pk-citypin-input"
              />
            </div>

            {/* TOTAL */}
            <div
              style={{
                marginTop: 22,
                background: CREAM,
                borderRadius: 16,
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 15, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                Total Amount
              </span>

              <strong style={{ fontSize: 22, fontWeight: 700, color: NAVY, fontFamily: "'Oswald', sans-serif" }}>
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
                borderRadius: 14,
                background: isFormValid ? NAVY : "#D8D8D8",
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: isFormValid ? "pointer" : "not-allowed",
                opacity: isFormValid ? 1 : 0.7,
                boxShadow: isFormValid ? "0 10px 26px rgba(13,27,42,0.28)" : "none",
                fontFamily: "'Barlow Condensed', sans-serif",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Place Order →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}