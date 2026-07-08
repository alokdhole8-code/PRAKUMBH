'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GOLD   = "#d4af37";
const NAVY   = "#0d1b2a";
const LIGHT  = "#f4f3f0";
const BORDER = "#e8e8e8";
const EASE   = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 639; // equivalent to the old `window.innerWidth < 640`

// ─── NAV DATA (hoisted: same array/object identity across every render) ─────
const MAIN_LINKS = [
  { label: "SHOP", href: "/shop" },
];

const CATEGORIES = [
  "T-Shirt",
  "Polo T-Shirts",
  "Oversized T-Shirt",
  "Prime Polo",
  "Cargo Pants",
  "Seen On Shark Tank",
  "Linen Shirt",
  "Socks",
  "Full Sleeve T-Shirt",
  "New Arrival",
  "Combos",
  "Bundles",
];

const DESKTOP_LEFT_LINKS = ["SHOP"];
const ICONS = ["person", "shopping_bag"];

const ANNOUNCEMENT_TEXT =
  "⚡ INDIA'S PREMIUM STREETWEAR BRAND ⚡ — NEW ARRIVALS NOW LIVE — FREE SHIPPING ABOVE ₹999 — ⚡ INDIA'S PREMIUM STREETWEAR BRAND ⚡ — NEW ARRIVALS NOW LIVE — FREE SHIPPING ABOVE ₹999 — ";

// ─── HOOK ─────────────────────────────────────────────────────────────────────
// Uses matchMedia + `change` instead of a `resize` listener. The old version
// recomputed `innerWidth < 640` on every `resize` tick — and on mobile,
// `resize` also fires when the browser's URL bar collapses/expands *during
// scrolling*, meaning it was re-running (and calling setState) on nearly
// every scroll frame on phones. matchMedia's `change` event only fires when
// the boolean actually flips across the breakpoint, so scrolling/resizing
// within the same breakpoint now causes zero renders.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
      : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches); // sync in case viewport changed before mount
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

// ─── ICONS (hoisted: static, prop-less SVGs never need to be rebuilt) ───────
const HAMBURGER_ICON = (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0" y="0" width="22" height="1.5" rx="0.75" fill="#111" />
    <rect x="0" y="7" width="14" height="1.5" rx="0.75" fill="#111" />
    <rect x="0" y="14" width="22" height="1.5" rx="0.75" fill="#111" />
  </svg>
);

const PERSON_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const BAG_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
    <path d="M6 2l3 7h9l3-7" />
    <path d="M3 9h18l-1.5 11H4.5L3 9z" />
  </svg>
);

// ─── ANNOUNCEMENT BAR ────────────────────────────────────────────────────────
export function AnnouncementBar({ hidden }) {
  return (
    <AnimatePresence mode="wait">
      {!hidden && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: -36 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            transform: "translateZ(0)",
            willChange: "transform",
            background: NAVY,
            height: 36,
            overflow: "hidden",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99998,
            contain: "layout paint", // isolates this subtree's reflow/paint scope
          }}
          className="w-full flex items-center"
        >
          <style>{`
            @keyframes marquee {
              from { transform: translate3d(0,0,0); }
              to   { transform: translate3d(-50%,0,0); }
            }
            .marquee-track {
              animation: marquee 18s linear infinite;
              will-change: transform;
              white-space: nowrap;
              display: flex;
            }
          `}</style>
          <div
            className="marquee-track"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "#fff",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <span style={{ paddingRight: "4rem" }}>{ANNOUNCEMENT_TEXT}</span>
            <span style={{ paddingRight: "4rem" }}>{ANNOUNCEMENT_TEXT}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
export default function Navbar({
  barHidden,
  setCartOpen,
  cartItems,
  setPageLoading,
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Stable handlers — created once per dependency change instead of a fresh
  // closure on every render, and reused across all buttons that need them.
  const goTo = useCallback((path) => {
    setPageLoading?.(true);
    router.push(path);
  }, [router, setPageLoading]);

  const goHome = useCallback(() => {
    if (window.location.pathname === "/") return;
    setPageLoading?.(true);
    router.push("/");
  }, [router, setPageLoading]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const goHomeFromDrawer = useCallback(() => {
    if (window.location.pathname === "/") {
      setDrawerOpen(false);
      return;
    }
    setPageLoading?.(true);
    setDrawerOpen(false);
    router.push("/");
  }, [router, setPageLoading]);

  const handleIconClick = useCallback((icon) => {
    if (icon === "person") goTo("/account");
    if (icon === "shopping_bag") setCartOpen(true);
  }, [goTo, setCartOpen]);

  const handleDesktopLinkClick = useCallback((l) => {
    goTo(l === "SHOP" ? "/shop" : "/collection");
  }, [goTo]);

  const handleDrawerLinkClick = useCallback((href) => {
    setDrawerOpen(false);
    goTo(href);
  }, [goTo]);

  // Only recomputed when `barHidden` or `isMobile` actually change — not on
  // every render triggered by, e.g., `cartItems` changing.
  const navStyle = useMemo(() => ({
    height: 58,
    borderBottom: `1px solid ${BORDER}`,
    background: "#fff",
    position: "fixed",
    top: 0,
    // KEY FIX: animate `transform` instead of `top`. Animating `top` forces
    // a layout recalculation on every single animation frame (main-thread,
    // synchronous). `transform: translate3d(...)` is handled by the
    // compositor/GPU and never touches layout — same visual motion, far
    // cheaper. This was the single biggest jank source in the original file.
    transform: `translate3d(0, ${barHidden ? 0 : 36}px, 0)`,
    transition: "transform 0.22s ease-out",
    willChange: "transform",
    left: 0,
    width: "100%",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    paddingLeft: isMobile ? 12 : "clamp(16px,4vw,40px)",
    paddingRight: isMobile ? 8 : "clamp(8px,3vw,32px)",
    overflow: "hidden",
    contain: "layout paint style",
  }), [barHidden, isMobile]);

  return (
    <>
      {/* ─── NAV BAR ────────────────────────────────────────────────────── */}
      <nav style={navStyle}>

        {/* ── LEFT ZONE ────────────────────────────────────────────────── */}
        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              onClick={openDrawer}
              aria-label="Open navigation menu"
              style={{
                width: 32,
                height: 32,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
              }}
            >
              {HAMBURGER_ICON}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              justifyContent: "flex-start",
              gap: 40,
              paddingLeft: 40,
            }}
          >
            {DESKTOP_LEFT_LINKS.map(l => (
              <button
                key={l}
                onClick={() => handleDesktopLinkClick(l)}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#111",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  fontWeight: 400,
                }}
                className="group"
              >
                {l}
                <span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    height: 1.5,
                    width: 0,
                    background: GOLD,
                    transition: "width 0.3s ease",
                  }}
                  className="group-hover:w-full"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── CENTER LOGO ──────────────────────────────────────────────── */}
        <div
          onClick={goHome}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'Oswald', sans-serif",
            fontSize: "clamp(18px,2.2vw,26px)",
            fontWeight: 600,
            letterSpacing: "0.22em",
            color: "#111",
            cursor: "pointer",
            whiteSpace: "nowrap",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          PRAKUMBH
        </div>

        {/* ── RIGHT ZONE — icons ────────────────────────────────────────── */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 0 : 4,
            flexShrink: 0,
          }}
        >
          {ICONS.map(icon => (
            <button
              key={icon}
              id={icon === "shopping_bag" ? "prakumbh-cart-btn" : undefined}
              className={`icon-btn${icon === "shopping_bag" ? " cart-icon-target" : ""}`}
              onClick={() => handleIconClick(icon)}
              aria-label={icon.replace("_", " ")}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
              }}
            >
              {icon === "person" ? PERSON_ICON : BAG_ICON}

              {icon === "shopping_bag" && cartItems?.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#000",
                    fontSize: 8,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    pointerEvents: "none",
                  }}
                >
                  {cartItems.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/*
          Hover background now driven by CSS (`:hover`) instead of
          onMouseEnter/onMouseLeave inline handlers. The old approach ran a
          JS event handler + style write on every hover in/out; native CSS
          `:hover` is handled by the browser's style engine with zero
          main-thread JS, which matters on low-end devices and trackpads.
        */}
        <style>{`.icon-btn:hover { background: ${LIGHT}; }`}</style>
      </nav>

      {/* ─── MOBILE HAMBURGER DRAWER ──────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeDrawer}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.44)",
                zIndex: 999994,
                WebkitTapHighlightColor: "transparent",
              }}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 365,
                maxWidth: "85vw",
                height: "100dvh",
                background: "#fff",
                zIndex: 999995,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                boxShadow: "8px 0 40px rgba(0,0,0,0.16)",
                contain: "layout paint style",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 18px",
                  height: 56,
                  borderBottom: `1px solid ${BORDER}`,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.34em",
                    color: "#111",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={goHomeFromDrawer}
                >
                  PRAKUMBH
                </span>

                <button
                  onClick={closeDrawer}
                  aria-label="Close navigation menu"
                  style={{
                    width: 28,
                    height: 28,
                    marginRight: 2,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 300,
                      color: "#222",
                      lineHeight: 1,
                      marginTop: -8,
                    }}
                  >
                    ×
                  </span>
                </button>
              </div>

              <div style={{ paddingTop: 6, paddingBottom: 0, flexShrink: 0 }}>
                {MAIN_LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.045, duration: 0.35, ease: EASE }}
                    onClick={() => handleDrawerLinkClick(link.href)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      height: 48,
                      textAlign: "left",
                      padding: "0 18px",
                      background: "#fff",
                      border: "none",
                      borderBottom: "1px solid #efefef",
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                      color: "#111",
                      cursor: "pointer",
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function CartDrawer({
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
}) {
  const isMobile = useIsMobile();
  const closeCart = useCallback(() => setCartOpen(false), [setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 999998,
            }}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 380,
              maxWidth: "100%",
              height: "100vh",
              background: "#fff",
              zIndex: 999999,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
              contain: "layout paint style",
            }}
          >
            <button
              onClick={closeCart}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 38,
                cursor: "pointer",
                alignSelf: "flex-end",
              }}
            >
              ×
            </button>

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
                  marginBottom: 30,
                  lineHeight: 1.5,
                }}
              >
                Have an account?{" "}
                <span style={{ textDecoration: "underline", cursor: "pointer" }}>
                  Log in
                </span>{" "}
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
                }}
              >
                Continue shopping
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}