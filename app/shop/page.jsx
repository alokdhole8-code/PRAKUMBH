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
// parent render.
const PREMIUM_INPUT_STYLE = {
  width: "100%",
  height: 56,
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: "0 16px",
  fontSize: 15,
  outline: "none",
  background: "#FAFAFA",
  color: "#111",
};

const ADDRESS_INPUT_STYLE = {
  width: "100%",
  height: 52,
  border: "1px solid #e7e7e7",
  borderRadius: 16,
  padding: "0 16px",
  marginBottom: 14,
  fontSize: 15,
  outline: "none",
  background: "#fff",
};

const CITY_PINCODE_INPUT_STYLE = {
  height: 52,
  border: "1px solid #e7e7e7",
  borderRadius: 16,
  padding: "0 16px",
  fontSize: 15,
  outline: "none",
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
  const isMobile = useIsMobile(640);

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
              background: "rgba(0,0,0,0.45)",
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
              width: 380,
              maxWidth: "100%",
              height: "100dvh",
              background: "#fff",
              zIndex: 2147483647,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* CLOSE */}
            <button
              onClick={closeCart}
              aria-label="Close cart"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 38,
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
                    marginTop: 28,
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
                        borderBottom: "1px solid #ececec",
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
                          width: 110,
                          height: 140,
                          objectFit: "contain",
                          background: "transparent",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            fontSize: 16,
                            lineHeight: 1.4,
                            fontWeight: 500,
                            color: "#111",
                            marginBottom: 8,
                          }}
                        >
                          {item.name}
                        </h4>
                        <p style={{ fontSize: 15, color: "#444", marginBottom: 14 }}>
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
                          <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                            {item.price}
                          </span>

                          {item.oldPrice && (
                            <span
                              style={{
                                fontSize: 13,
                                color: "#aaa",
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
                              border: "1px solid #e5e5e5",
                              borderRadius: 6,
                              overflow: "hidden",
                              height: 50,
                            }}
                          >
                            <button
                              onClick={() => decrementQty(item)}
                              aria-label="Decrease quantity"
                              style={{
                                width: 48,
                                height: "100%",
                                border: "none",
                                background: "#fff",
                                fontSize: 22,
                                cursor: "pointer",
                                color: "#222",
                              }}
                            >
                              −
                            </button>

                            <div
                              style={{
                                width: 40,
                                textAlign: "center",
                                fontSize: 16,
                                color: "#111",
                              }}
                            >
                              {item.quantity || 1}
                            </div>

                            <button
                              onClick={() => incrementQty(item)}
                              aria-label="Increase quantity"
                              style={{
                                width: 48,
                                height: "100%",
                                border: "none",
                                background: "#fff",
                                fontSize: 22,
                                cursor: "pointer",
                                color: "#222",
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
                            <span className="material-symbols-outlined" style={{ color: "#222" }}>
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
                    borderTop: "1px solid #ececec",
                    paddingTop: 24,
                    marginTop: 0,
                    position: "sticky",
                    bottom: 0,
                    background: "#fff",
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
                    <span style={{ fontSize: 16, color: "#444", fontWeight: 500 }}>
                      Estimated total
                    </span>

                    <span style={{ fontSize: 26, fontWeight: 700, color: "#111", lineHeight: 1 }}>
                      ₹{cartTotal}.00
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: "#888", marginBottom: 16, lineHeight: 1.5 }}>
                    Duties and taxes included. Shipping calculated at checkout.
                  </p>

                  <button
                    onClick={openAddress}
                    style={{
                      width: "100%",
                      height: 58,
                      border: "none",
                      background: "#000",
                      borderRadius: 18,
                      fontSize: 18,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      color: "#fff",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
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
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  paddingBottom: 40,
                  marginTop: 60,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: isMobile ? 31 : 40,
                    fontWeight: 700,
                    color: "#14213d",
                    marginBottom: 18,
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
                    color: "#222",
                    marginBottom: 34,
                    lineHeight: 1.5,
                  }}
                >
                  Have an account?{" "}
                  <span style={{ textDecoration: "underline", cursor: "pointer" }}>Log in</span>{" "}
                  to check out faster.
                </p>

                <button
                  onClick={closeCart}
                  style={{
                    border: "none",
                    background: "#000",
                    color: "#fff",
                    height: 50,
                    minWidth: 195,
                    padding: "0 34px",
                    borderRadius: 14,
                    cursor: "pointer",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
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
const ShopHero = memo(function ShopHero() {
  const isMobile = useIsMobile(768);

  return (
    <section
      style={{
        position: "relative",
        height: isMobile ? "220px" : "720px",
        overflow: "hidden",
        background: "#060d18",
      }}
    >
      {/* BG IMAGE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/shopPage.webp')",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#060d18",
          filter: "brightness(0.92)",
          backgroundSize: "cover",
          backgroundPosition: isMobile ? "center center" : "center 35%",
        }}
      />
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
    <section style={{ background: "#fff", padding: "18px clamp(16px,4vw,48px) 2px", overflowX: "auto" }}>
      <div
        className="category-scroll"
        style={{
          display: "flex",
          gap: 1,
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
              minWidth: 88,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: activeCategory === cat.id ? NAVY : "#f4f3f0",
                border: `2px solid ${activeCategory === cat.id ? NAVY : "transparent"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                transition: "all 0.25s ease",
                boxShadow: activeCategory === cat.id ? `0 6px 20px rgba(13,27,42,0.25)` : "none",
                transform: activeCategory === cat.id ? "scale(1.08)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.background = "#ebebeb";
                  e.currentTarget.style.transform = "scale(1.06)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.background = "#f4f3f0";
                  e.currentTarget.style.transform = "scale(1)";
                }
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
                  sizes="68px"
                  loading="lazy"
                  decoding="async"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                marginTop: 4,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: activeCategory === cat.id ? NAVY : "#666",
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 72,
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
const FilterBar = memo(function FilterBar({ filters, setFilters, sort, setSort, totalCount, filteredCount }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const isMobile = useIsMobile(768);
  const ref = useRef(null);

  // `useRouter()` was called here previously but `router` was never actually
  // referenced anywhere in this component — an unused hook subscription that
  // could cause pointless re-renders on route/query changes. Removed.

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleSize = useCallback(
    (sz) => {
      setFilters((f) => ({
        ...f,
        sizes: f.sizes.includes(sz) ? f.sizes.filter((s) => s !== sz) : [...f.sizes, sz],
      }));
    },
    [setFilters]
  );

  const togglePrice = useCallback(
    (range) => {
      setFilters((f) => ({
        ...f,
        priceRange: f.priceRange === range.label ? null : range.label,
      }));
    },
    [setFilters]
  );

  const clearAll = useCallback(
    () => setFilters({ sizes: [], priceRange: null, inStock: false }),
    [setFilters]
  );

  const closeMobileFilter = useCallback(() => setMobileFilterOpen(false), []);

  const hasFilters = filters.sizes.length > 0 || filters.priceRange || filters.inStock;

  return (
    <div
      ref={ref}
      style={{
        position: "sticky",
        top: 56,
        zIndex: 200,
        background: "#fff",
        borderBottom: `1px solid ${BORDER}`,
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      <div
        style={{
          maxWidth: 1700,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {isMobile && (
          <>
            <AnimatePresence>
              {mobileFilterOpen && (
                <>
                  <div
                    onClick={closeMobileFilter}
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(0,0,0,0.45)",
                      zIndex: 999999,
                    }}
                  />

                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "92%",
                      maxWidth: 360,
                      height: "100dvh",
                      background: "#fff",
                      zIndex: 9999999,
                      overflowY: "auto",
                      padding: "20px 18px 120px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 28,
                      }}
                    >
                      <h2 style={{ fontSize: 24, color: NAVY, fontWeight: 700 }}>Filter</h2>

                      <button
                        onClick={closeMobileFilter}
                        aria-label="Close filters"
                        style={{
                          border: "none",
                          background: "transparent",
                          fontSize: 34,
                          cursor: "pointer",
                          color: "#222",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    {/* AVAILABILITY */}
                    <div
                      style={{
                        paddingBottom: 24,
                        borderBottom: "1px solid #ececec",
                        marginBottom: 24,
                      }}
                    >
                      <h3 style={{ fontSize: 18, marginBottom: 18, color: "#444" }}>Availability</h3>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 16,
                          fontSize: 16,
                          color: "#666",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, inStock: e.target.checked }))
                          }
                          style={{ width: 22, height: 22, accentColor: NAVY }}
                        />
                        In stock
                      </label>
                    </div>

                    {/* SIZE */}
                    <div
                      style={{
                        paddingBottom: 24,
                        borderBottom: "1px solid #ececec",
                        marginBottom: 24,
                      }}
                    >
                      <h3 style={{ fontSize: 18, marginBottom: 18, color: "#444" }}>Size</h3>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4,1fr)",
                          gap: 12,
                        }}
                      >
                        {SIZES.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => toggleSize(sz)}
                            style={{
                              height: 44,
                              border: filters.sizes.includes(sz)
                                ? `1.5px solid ${NAVY}`
                                : "1px solid #ddd",
                              background: filters.sizes.includes(sz) ? NAVY : "#fff",
                              color: filters.sizes.includes(sz) ? "#fff" : "#333",
                              borderRadius: 14,
                              fontSize: 15,
                              cursor: "pointer",
                            }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SORT */}
                    <div style={{ marginBottom: 28 }}>
                      <h3 style={{ fontSize: 18, marginBottom: 18, color: "#444" }}>Sort</h3>

                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{
                          width: "100%",
                          height: 52,
                          border: "1px solid #ddd",
                          borderRadius: 12,
                          padding: "0 14px",
                          fontSize: 15,
                          background: "#fff",
                        }}
                      >
                        {SORT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* BUTTON */}
                    <button
                      onClick={closeMobileFilter}
                      style={{
                        position: "fixed",
                        left: 30,
                        right: 30,
                        bottom: 22,
                        height: 54,
                        borderRadius: 18,
                        border: "none",
                        background: NAVY,
                        color: "#fff",
                        fontSize: 17,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      See {filteredCount} items
                    </button>
                  </div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
});

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
        onClick={handleCardClick}
        onMouseEnter={handlePrefetch}
        onTouchStart={handlePrefetch}
        style={{ cursor: "pointer" }}
      >
        {/* IMAGE WRAP */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            marginBottom: 14,
          }}
        >
          {/* IMAGE */}
          <Image
            src={imageSrc}
            alt={product.name}
            width={400}
            height={500}
            priority={false}
            loading="lazy"
            decoding="async"
            quality={35}
            sizes="(max-width:640px) 50vw, 25vw"
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
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
          <div style={{ display: "flex", gap: 6 }}>
            {Object.keys(product.images || {}).map((colorKey, i) => (
              <div
                key={i}
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
                  width: 13,
                  height: 13,
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
                  border:
                    selectedColor === colorKey
                      ? "2px solid #0A2A66"
                      : colorKey === "white"
                      ? "1px solid #999"
                      : "1px solid #dcdcdc",
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
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
        <h3
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 36,
            color: NAVY,
            marginBottom: 8,
            letterSpacing: "0.06em",
          }}
        >
          No products found
        </h3>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            color: "#888",
            letterSpacing: "0.04em",
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
  const isMobile = useIsMobile(768);

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

        {/* 3. FILTER BAR */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          totalCount={products.length}
          filteredCount={displayProducts.length}
        />

        {/* 4. PRODUCTS + BANNER */}
        <div style={{ maxWidth: 1700, margin: "0 auto", padding: "20px clamp(16px,4vw,48px) 80px" }}>
          {/* SECTION HEADING */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 36, height: 2, background: GOLD }} />
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
          </div>

          {/* GRID */}
          <ProductGrid
            products={displayProducts}
            setCartOpen={setCartOpen}
            setCartItems={setCartItems}
            setPageLoading={setPageLoading}
          />
        </div>

        {/* FOOTER STRIP — exact match to homepage */}
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
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, letterSpacing: "0.3em", color: "#fff" }}>
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
            © 2025 Prakumbh. India&apos;s Premium Streetwear.
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Instagram", "Twitter", "YouTube"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {pageLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading page"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999999,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: "4px solid #ddd",
              borderTop: "4px solid #0D1B2A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      )}

      {addressOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2147483648,
            padding: 16,
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "92vw",
              background: "#fff",
              borderRadius: 34,
              padding: "28px 28px 32px",
              boxShadow: "0 20px 60px rgba(0,0,0,.18)",
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
                    color: "#999",
                    marginBottom: 10,
                  }}
                >
                  SECURE CHECKOUT
                </div>

                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    margin: 0,
                    color: "#111",
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

            {/* INPUTS */}
            <input
              placeholder="Full Name"
              aria-label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
            />

            <input
              placeholder="Phone Number"
              aria-label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
            />

            <input
              placeholder="Complete Address"
              aria-label="Complete Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
            />
            <input
              placeholder="Landmark"
              aria-label="Landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              style={ADDRESS_INPUT_STYLE}
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
              />
              <input
                placeholder="Pincode"
                aria-label="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={CITY_PINCODE_INPUT_STYLE}
              />
            </div>

            {/* TOTAL */}
            <div
              style={{
                marginTop: 22,
                background: "#f6f6f6",
                borderRadius: 18,
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 17, color: "#222" }}>Total Amount</span>

              <strong style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>
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
                borderRadius: 18,
                background: isFormValid ? "#111" : "#CFCFCF",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: ".02em",
                cursor: isFormValid ? "pointer" : "not-allowed",
                opacity: isFormValid ? 1 : 0.7,
              }}
            >
              PLACE ORDER →
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