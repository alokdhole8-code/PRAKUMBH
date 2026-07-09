'use client';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useRouter, useParams } from "next/navigation";
import { products, GOLD, NAVY, LIGHT, BORDER } from "../../data/products";
import { motion, AnimatePresence } from "framer-motion";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { useCart } from "@/components/CartProvider";
import Image from "next/image";
import { handleBuyNow } from "@/lib/buyNow";
import CustomerReviews from "@/components/CustomerReviews";

// ─── FLY-TO-CART CSS INJECTION (idempotent, moved to a one-time effect below) ─
function injectFlyToCartCSS() {
  if (typeof window === "undefined") return;
  if (document.getElementById("ftc-css")) return;
  const s = document.createElement("style");
  s.id = "ftc-css";
  s.textContent = `
    @keyframes ftcCartBounce {
      0%   { transform: scale(1)    rotate(0deg); }
      14%  { transform: scale(1.38) rotate(-18deg); }
      28%  { transform: scale(1.26) rotate(14deg); }
      42%  { transform: scale(1.18) rotate(-10deg); }
      56%  { transform: scale(1.10) rotate(6deg); }
      70%  { transform: scale(1.05) rotate(-3deg); }
      84%  { transform: scale(1.02) rotate(1deg); }
      100% { transform: scale(1)    rotate(0deg); }
    }
    .ftc-bounce { animation: ftcCartBounce 620ms cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
    @keyframes ftcBadgePulse {
      0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(200,60,60,0.55); }
      30%  { transform: scale(1.65); box-shadow: 0 0 0 6px rgba(200,60,60,0.22); }
      60%  { transform: scale(0.88); box-shadow: 0 0 0 9px rgba(200,60,60,0.06); }
      100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(200,60,60,0); }
    }
    .ftc-badge-pulse > span,
    .ftc-badge-pulse > div { animation: ftcBadgePulse 700ms cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .ftc-spark { position:fixed; top:0; left:0; border-radius:50%; pointer-events:none; z-index:2147483646; will-change:transform,opacity; }
    .ftc-ring  { position:fixed; border-radius:50%; pointer-events:none; z-index:2147483645; }
    .ftc-item  {
      position:fixed; top:0; left:0; width:64px; height:64px;
      border-radius:14px; overflow:hidden;
      border:2.5px solid rgba(255,255,255,0.92);
      box-shadow:0 8px 32px rgba(0,0,0,0.32),0 2px 8px rgba(0,0,0,0.18);
      pointer-events:none; z-index:2147483647;
      will-change:transform,opacity; background:#f4f3f0;
    }
  `;
  document.head.appendChild(s);
}

const EASE = [0.16, 1, 0.3, 1];

// ─── STATIC / MODULE-LEVEL DATA (hoisted so it's never recreated per render) ─
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SIZE_CHART_ROWS = [
  ["S", "38", "26", "7.5"],
  ["M", "40", "27", "8"],
  ["L", "42", "28", "8.5"],
  ["XL", "44", "30", "9"],
  ["XXL", "46", "31", "9.5"],
  ["3XL", "48", "31", "10"],
  ["4XL", "50", "31", "11"],
];

const SIZE_CHART_HEADERS = ["SIZE", "CHEST (IN)", "LENGTH (IN)", "SLEEVE (IN)"];

const DELIVERY_INFO = [
  { icon: "📦", strong: "Free Delivery", text: "on orders above ₹999" },
  { icon: "🚚", strong: "3–5 business days", text: "estimated delivery" },
];

const ACCORDION_DATA = [
  {
    id: "details",
    title: "Product Details",
    body: "Crafted from 100% premium cotton with a structured drape and military-inspired detailing. Relaxed fit, designed for layering. Reinforced seams, YKK zippers, and a DWR water-resistant finish ensure this piece performs as hard as it looks.",
  },
  {
    id: "material",
    title: "Material & Care",
    body: "Shell: 98% Cotton, 2% Spandex. Machine wash cold on gentle cycle. Do not bleach. Tumble dry low. Iron on reverse side only. Dry cleaning recommended for longevity.",
  },
  {
    id: "shipping",
    title: "Shipping & Returns",
    body: "We ship pan-India within 24 hours of order confirmation. Express delivery available at checkout. Returns accepted within 30 days — item must be unworn and in original packaging with all tags intact.",
  },
];

const COLOR_HEX_MAP = {
  black: "#000000",
  blue: "#256D85",
  pink: "#B04A7A",
  green: "#8A9A5B",
  grey: "#8E8E8E",
};

const SPARK_COLORS = ["#FFD700", "#FFC107", "#fff", "#B3D9FF", "#FF9DC4", "#A8FFD1", "#FF7043", "#E040FB"];

// Pure helper — module scope so it's never re-created per render/component instance
function parsePrice(str) {
  return parseFloat(
    String(str || "0").replace(/[₹,]/g, "")
  ) || 0;
}

function cubicBezierPoint(t, p0, p1, p2, p3) {
  const m = 1 - t;
  return m * m * m * p0 + 3 * m * m * t * p1 + 3 * m * t * t * p2 + t * t * t * p3;
}
function easeInOutFly(t) {
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// ─── SPARKLE ────────────────────────────────────────────────────────────────
const Sparkle = memo(function Sparkle({ cx, cy, size, color, tx, ty, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${tx}px,${ty}px) scale(0)`, opacity: 0 },
      ],
      { duration: 500, delay, easing: "cubic-bezier(0.2,0,0.8,1)", fill: "forwards" }
    );
    return () => anim.cancel();
  }, [tx, ty, delay]);
  return (
    <div
      ref={ref}
      className="ftc-spark"
      style={{ width: size, height: size, left: cx - size / 2, top: cy - size / 2, background: color }}
    />
  );
});

// ─── IMPACT RING ─────────────────────────────────────────────────────────────
const ImpactRing = memo(function ImpactRing({ cx, cy }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const anim = el.animate(
      [
        { transform: "scale(0.5)", opacity: 0.9, borderWidth: "3px" },
        { transform: "scale(2.8)", opacity: 0, borderWidth: "0.5px" },
      ],
      { duration: 550, easing: "cubic-bezier(0.2,0,0.5,1)", fill: "forwards" }
    );
    return () => anim.cancel();
  }, []);
  return (
    <div
      ref={ref}
      className="ftc-ring"
      style={{ width: 44, height: 44, left: cx - 22, top: cy - 22, border: "3px solid #FFD700" }}
    />
  );
});

// ─── PREMIUM FLYING ITEM ──────────────────────────────────────────────────────
const FlyingItem = memo(function FlyingItem({ fly, onComplete }) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const tsRef = useRef(null);
  const [impact, setImpact] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!fly || !ref.current) return;
    const el = ref.current;
    const { startX, startY, endX, endY } = fly;

    const dx = endX - startX;
    const dy = endY - startY;
    const up = Math.min(Math.abs(dy), 180) + 80;
    const cp1x = startX + dx * 0.08, cp1y = startY - up;
    const cp2x = startX + dx * 0.82, cp2y = endY - up * 0.35;

    let cancelled = false;

    function frame(ts) {
      if (cancelled) return;
      if (!tsRef.current) tsRef.current = ts;
      const raw = Math.min((ts - tsRef.current) / 950, 1);
      const t = easeInOutFly(raw);

      const x = cubicBezierPoint(t, startX, cp1x, cp2x, endX);
      const y = cubicBezierPoint(t, startY, cp1y, cp2y, endY);
      const sc = raw < 0.4 ? 1 + raw * 0.15 : 1.06 - ((raw - 0.4) / 0.6) * 0.71;
      const rot = Math.sin(raw * Math.PI) * 26 * (1 - raw * 0.6);
      const wob = Math.sin(raw * Math.PI * 3.2) * (1 - raw) * 7;
      const op = raw < 0.78 ? 1 : 1 - (raw - 0.78) / 0.22;

      el.style.transform = `translate3d(${x + wob}px,${y}px,0) scale(${sc}) rotate(${rot}deg)`;
      el.style.opacity = op;

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setVisible(false);
        setImpact({ cx: endX + 32, cy: endY + 32 });
        const cartEl = document.querySelector(".cart-icon-target");
        if (cartEl) {
          cartEl.classList.remove("ftc-bounce");
          void cartEl.offsetWidth;
          cartEl.classList.add("ftc-bounce");
          cartEl.classList.add("ftc-badge-pulse");
          setTimeout(() => {
            cartEl.classList.remove("ftc-bounce", "ftc-badge-pulse");
          }, 720);
        }
        setTimeout(() => onComplete(fly.id), 750);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fly, onComplete]);

  const sparks = useMemo(() => {
    if (!impact) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const angle = i * (360 / 14) + Math.random() * 25;
      const dist = 18 + Math.random() * 32;
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        cx: impact.cx,
        cy: impact.cy,
        size: 3 + Math.random() * 6,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        delay: Math.random() * 60,
      };
    });
  }, [impact]);

  if (!fly) return null;

  return (
    <>
      {visible && (
        <div
          ref={ref}
          className="ftc-item"
          style={{ transform: `translate3d(${fly.startX}px,${fly.startY}px,0) scale(1)`, opacity: 1 }}
        >
          <img
            src={fly.imgSrc}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0) 60%)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      {impact && (
        <>
          <ImpactRing cx={impact.cx} cy={impact.cy} />
          {sparks.map((s) => (
            <Sparkle key={s.id} {...s} />
          ))}
        </>
      )}
    </>
  );
});

// ─── CART DRAWER — exact copy from homepage, memoized ───────────────────────
const CartDrawer = memo(function CartDrawer({ cartOpen, setCartOpen, cartItems, setCartItems, setAddressOpen }) {
  const cartTotal = useMemo(
    () => cartItems.reduce((t, item) => t + parsePrice(item.price) * (item.quantity || 1), 0),
    [cartItems]
  );

  const incrementItem = useCallback(
    (item) => {
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.id === item.id && ci.selectedColor === item.selectedColor && ci.selectedSize === item.selectedSize
            ? { ...ci, quantity: (ci.quantity || 1) + 1 }
            : ci
        )
      );
    },
    [setCartItems]
  );

  const decrementItem = useCallback(
    (item) => {
      setCartItems((prev) =>
        prev.map((ci) =>
          ci.id === item.id && ci.selectedColor === item.selectedColor && ci.selectedSize === item.selectedSize
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
        prev.filter((ci) => !(ci.id === item.id && ci.selectedColor === item.selectedColor && ci.selectedSize === item.selectedSize))
      );
    },
    [setCartItems]
  );

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCartOpen(false)}
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
              height: "100dvh",
              background: "#fff",
              zIndex: 999999,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => setCartOpen(false)}
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
                    marginTop: 40,
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
                        gap: 16,
                        paddingBottom: 24,
                        marginBottom: 34,
                        borderBottom: "1px solid #ececec",
                      }}
                    >
                      <Image
                        src={item.images?.[item.selectedColor || item.defaultColor || "black"]?.back}
                        alt={item.name}
                        width={110}
                        height={140}
                        loading="lazy"
                        sizes="110px"
                        style={{
                          width: 110,
                          height: 140,
                          objectFit: "contain",
                          background: "#f7f7f7",
                          borderRadius: 8,
                          padding: 4,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                              {item.selectedColor ? `${item.selectedColor} · ${item.selectedSize || "M"}` : "Black · M"}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
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
                                  onClick={() => decrementItem(item)}
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
                                    width: 48,
                                    textAlign: "center",
                                    fontSize: 20,
                                    color: "#111",
                                  }}
                                >
                                  {item.quantity || 1}
                                </div>
                                <button
                                  onClick={() => incrementItem(item)}
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
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2">
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    borderTop: "1px solid #ececec",
                    paddingTop: 18,
                    marginTop: 10,
                    position: "sticky",
                    bottom: 0,
                    background: "#fff",
                    zIndex: 10,
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
                        fontSize: 16,
                        color: "#444",
                        fontWeight: 500,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      Estimated total
                    </span>
                    <span style={{ fontSize: 34, fontWeight: 700, color: "#111" }}>₹{cartTotal}.00</span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#888",
                      marginBottom: 16,
                      lineHeight: 1.5,
                    }}
                  >
                    Duties and taxes included. Shipping calculated at checkout.
                  </p>
                  <button
                    onClick={() => setAddressOpen(true)}
                    style={{
                      width: "100%",
                      height: 64,
                      borderRadius: 18,
                      border: "none",
                      background: "#111",
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
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
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#000",
                    marginBottom: 12,
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Your cart is empty
                </h2>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
                  Have an account? <span style={{ textDecoration: "underline" }}>Log in</span> to check out faster.
                </p>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: 12,
                    fontSize: 14,
                    cursor: "pointer",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ─── ADDRESS MODAL — split out with its own local state so keystrokes ───────
// no longer re-render the entire product page (major INP / TBT win).
const AddressModal = memo(function AddressModal({ open, onClose, cartItems, setCartItems, setCartOpen }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const isFormValid = Boolean(
    fullName.trim() && phone.trim() && address.trim() && city.trim() && pincode.trim()
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + parsePrice(item.price) * (item.quantity || 1), 0),
    [cartItems]
  );

  const resetForm = useCallback(() => {
    setFullName("");
    setPhone("");
    setAddress("");
    setLandmark("");
    setCity("");
    setPincode("");
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!isFormValid) return;

    const currentUser = JSON.parse(localStorage.getItem("prakumbh_current"));

    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("prakumbh_users")) || [];
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
          shippingAddress: {
            name: fullName,
            phone,
            address,
            landmark,
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

    const message = "Send this message to confirm your order.";

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
      quantity: cartItems.reduce((t, i) => t + (i.quantity || 1), 0),
      amount: cartTotal,
    };

    const whatsappUrl = `https://wa.me/918766599895?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    setTimeout(() => {
      fetch(
        "https://script.google.com/macros/s/AKfycbxYG8KeTKrt2sLhhrCyJ52m0E5XWUTzZYsYcmObNoDJm5q_ol_jXv_1XIM-lnTo-YsrLg/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(orderPayload),
        }
      ).catch(console.error);
    }, 0);

    onClose();
    setCartOpen(false);
    setCartItems([]);
    resetForm();
  }, [isFormValid, cartItems, cartTotal, fullName, phone, address, landmark, city, pincode, onClose, setCartOpen, setCartItems, resetForm]);

  if (!open) return null;

  return (
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
            onClick={onClose}
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
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #e7e7e7",
            borderRadius: 16,
            padding: "0 16px",
            marginBottom: 14,
            fontSize: 15,
            outline: "none",
            background: "#fff",
          }}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #e7e7e7",
            borderRadius: 16,
            padding: "0 16px",
            marginBottom: 14,
            fontSize: 15,
            outline: "none",
            background: "#fff",
          }}
        />

        <input
          placeholder="Complete Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #e7e7e7",
            borderRadius: 16,
            padding: "0 16px",
            marginBottom: 14,
            fontSize: 15,
            outline: "none",
            background: "#fff",
          }}
        />
        <input
          placeholder="Landmark"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          style={{
            width: "100%",
            height: 52,
            border: "1px solid #e7e7e7",
            borderRadius: 16,
            padding: "0 16px",
            marginBottom: 14,
            fontSize: 15,
            outline: "none",
            background: "#fff",
          }}
        />

        {/* CITY + PINCODE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 12,
            width: "100%",
          }}
        >
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              height: 52,
              border: "1px solid #e7e7e7",
              borderRadius: 16,
              padding: "0 16px",
              fontSize: 15,
              outline: "none",
            }}
          />
          <input
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            style={{
              height: 52,
              border: "1px solid #e7e7e7",
              borderRadius: 16,
              padding: "0 16px",
              fontSize: 15,
              outline: "none",
            }}
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
          <span
            style={{
              fontSize: 17,
              color: "#222",
            }}
          >
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
  );
});

// ─── PRODUCT DETAIL PAGE ─────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const [buyNowProduct, setBuyNowProduct] = useState({
    name: "Cart Order",
    color: "N/A",
    size: "N/A",
    quantity: 1,
    price: 0,
  });

  const params = useParams();
  const router = useRouter();

  const { cartOpen, setCartOpen, cartItems, setCartItems } = useCart();

  const [barHidden, setBarHidden] = useState(false);

  // ── FLYING ANIMATION STATE ────────────────────────────────────────────────
  const [flyItems, setFlyItems] = useState([]);
  const [cartShaking, setCartShaking] = useState(false);

  const handleFlyComplete = useCallback((id) => {
    setFlyItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ── ONE-TIME CSS INJECTION (moved out of render/module-eval into an effect) ─
  useEffect(() => {
    injectFlyToCartCSS();
  }, []);

  // ── PRODUCT STATE ─────────────────────────────────────────────────────────
  const product = useMemo(
    () => products.find((p) => String(p.id) === String(params?.id)) || products[0],
    [params?.id]
  );

  const [activeThumb, setActiveThumb] = useState(0);

  const touchStartX = useRef(0);

  const [selectedColor, setSelectedColor] = useState(product.defaultColor || "black");

  const activeColor = selectedColor || product.defaultColor || "black";

  const thumbnails = useMemo(
    () => [product.images?.[activeColor]?.back, product.images?.[activeColor]?.front].filter(Boolean),
    [product, activeColor]
  );

  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);

  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  // ── SCROLL LISTENER (announcement bar hide) ───────────────────────────────
  const lastHidden = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handle = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const hidden = window.scrollY > 40;
        if (hidden !== lastHidden.current) {
          lastHidden.current = hidden;
          setBarHidden(hidden);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // ── DERIVED / MEMOIZED VALUES ─────────────────────────────────────────────
  const discount = useMemo(() => {
    if (!product.oldPrice) return 0;
    return Math.round(((parsePrice(product.oldPrice) - parsePrice(product.price)) / parsePrice(product.oldPrice)) * 100);
  }, [product]);

  const related = useMemo(() => products.filter((p) => p.id !== product.id).slice(0, 2), [product.id]);

  const validateSelection = useCallback(() => {
    if (!selectedColor) {
      alert("Please select a color");
      return false;
    }
    if (!selectedSize) {
      alert("Please select a size");
      return false;
    }
    return true;
  }, [selectedColor, selectedSize]);

  // ── FLYING ANIMATION TRIGGER ──────────────────────────────────────────────
  const triggerFlyAnimation = useCallback(
    (buttonEl) => {
      const cartEl = document.querySelector(".cart-icon-target");
      if (!buttonEl || !cartEl) return;

      const btnRect = buttonEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();

      const startX = btnRect.left + btnRect.width / 2 - 27;
      const startY = btnRect.top + btnRect.height / 2 - 27;
      const endX = cartRect.left + cartRect.width / 2 - 27;
      const endY = cartRect.top + cartRect.height / 2 - 27;

      const flyId = Date.now() + Math.random();

      setFlyItems((prev) => [
        ...prev,
        { id: flyId, startX, startY, endX, endY, imgSrc: thumbnails[activeThumb] },
      ]);

      setTimeout(() => {
        setCartShaking(true);
        setTimeout(() => setCartShaking(false), 600);
      }, 820);
    },
    [thumbnails, activeThumb]
  );

  const handleAddToCart = useCallback(
    (e) => {
      if (!validateSelection()) return;

      triggerFlyAnimation(e.currentTarget);

      setCartItems((prev) => {
        const exists = prev.find(
          (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
        );
        if (exists) {
          return prev.map((i) =>
            i.id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
              ? { ...i, quantity: (i.quantity || 1) + qty }
              : i
          );
        }
        return [...prev, { ...product, quantity: qty, selectedColor, selectedSize }];
      });

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1000);
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 50);
    },
    [validateSelection, triggerFlyAnimation, product, qty, selectedColor, selectedSize, setCartItems]
  );

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff > 50 && activeThumb < thumbnails.length - 1) {
        setActiveThumb(activeThumb + 1);
      }
      if (diff < -50 && activeThumb > 0) {
        setActiveThumb(activeThumb - 1);
      }
    },
    [activeThumb, thumbnails.length]
  );

  const toggleSizeChart = useCallback(() => setSizeChartOpen((v) => !v), []);
  const closeAddressModal = useCallback(() => setAddressOpen(false), []);
  const openAddressModal = useCallback(() => setAddressOpen(true), []);
  const decQty = useCallback(() => setQty((q) => Math.max(1, q - 1)), []);
  const incQty = useCallback(() => setQty((q) => Math.min(10, q + 1)), []);
  const goHome = useCallback(() => router.push("/"), [router]);

  // ── STYLES (memoized on barHidden, the only value they depend on) ─────────
  const S = useMemo(
    () => ({
      page: {
        fontFamily: "'Barlow Condensed', sans-serif",
        background: "#fff",
        minHeight: "100vh",
        paddingTop: barHidden ? 58 : 94,
        transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
      },
      inner: {
        maxWidth: 1340,
        margin: "0 auto",
        padding: "0 clamp(16px,4vw,48px)",
      },
      breadcrumb: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "20px 0 32px",
        fontSize: 12,
        color: "#888",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      },
      thumb: (active) => ({
        width: 68,
        height: 84,
        border: `1.5px solid ${active ? NAVY : "transparent"}`,
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        opacity: active ? 1 : 0.55,
        transition: "border-color 0.2s, opacity 0.2s",
        background: "#f4f3f0",
        flexShrink: 0,
      }),
      sectionLabel: {
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#555",
        marginBottom: 10,
      },
      sizeBtn: (active, oos) => ({
        minWidth: 48,
        height: 44,
        padding: "0 14px",
        border: `1.5px solid ${active ? NAVY : "#e0e0e0"}`,
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 600,
        background: active ? NAVY : "#fff",
        color: active ? "#fff" : oos ? "#ccc" : "#111",
        cursor: oos ? "not-allowed" : "pointer",
        transition: "all 0.18s",
        textDecoration: oos ? "line-through" : "none",
        opacity: oos ? 0.45 : 1,
        letterSpacing: "0.04em",
        fontFamily: "'Barlow Condensed', sans-serif",
      }),
      btnCart: {
        height: 54,
        width: "100%",
        border: "none",
        borderRadius: 4,
        background: NAVY,
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "background 0.2s, transform 0.15s",
        fontFamily: "'Barlow Condensed', sans-serif",
        flex: 1,
      },
    }),
    [barHidden]
  );

  return (
    <>
      {/* FONTS + ICONS */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Barlow Condensed', sans-serif; background: #fff; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        button { outline: none; }
        .group:hover .group-hover\\:w-full { width: 100% !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ccc; }
        * { -webkit-tap-highlight-color: transparent; }

        /* ── ACCORDION ── */
        .accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
        .accordion-body.open { max-height: 400px; }

        /* ── HOVER STATES ── */
        .thumb-item:hover { opacity: 1 !important; border-color: ${NAVY} !important; }
.btn-cart:hover {
  background: ${NAVY} !important;
  transform: translateY(-1px);
}        .btn-buy:hover  { background: #1a1a1a !important; transform: translateY(-1px); }
        .btn-cart:active, .btn-buy:active { transform: translateY(0); }
        .size-btn:not([disabled]):hover { border-color: ${NAVY} !important; color: ${NAVY} !important; }
        .offer-box:hover { border-color: ${NAVY} !important; background: #f8f7f4 !important; }
        .related-card:hover img { transform: scale(1.06); }
        .breadcrumb-link:hover { color: #111 !important; }

        /* ── TOAST ── */
        .toast { pointer-events: none; opacity: 0; transition: opacity 0.3s; }
        .toast.visible { opacity: 1; }

        /* ── CART ICON SHAKE ANIMATION ── */
        @keyframes cartShake {
          0%,100% { transform: rotate(0deg) scale(1); }
          20%      { transform: rotate(-18deg) scale(1.25); }
          40%      { transform: rotate(14deg) scale(1.18); }
          60%      { transform: rotate(-10deg) scale(1.12); }
          80%      { transform: rotate(6deg) scale(1.06); }
        }
        .cart-icon-shaking {
          animation: cartShake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .color-circle {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
            min-height: 44px !important;
            border-radius: 50% !important;
          }
          .product-grid { grid-template-columns: 1fr !important; }
          .thumb-col { flex-direction: row !important; gap: 8px !important; padding-bottom: 12px !important; }
          .thumb-col {
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  gap: 10px !important;
  margin-top: 14px !important;
  padding-bottom: 0 !important;
}
          @media (max-width: 900px) {
            .mobile-slider-dots button {
              width: 10px !important;
              height: 10px !important;
              border-radius: 50% !important;
              margin: 0 !important;
            }
          }
          .info-col { padding-left: 0 !important; padding-top: 24px !important; }
          .offer-grid { grid-template-columns: 1fr !important; }
          .btn-row { flex-direction: column !important; }
        }
        @media (max-width: 600px) {
          .related-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <AnnouncementBar hidden={barHidden} />

      <Navbar barHidden={barHidden} setCartOpen={setCartOpen} cartItems={cartItems} cartShaking={cartShaking} />

      <CartDrawer
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
        setAddressOpen={setAddressOpen}
      />

      {/* ── FLYING ITEMS PORTAL ── */}
      {flyItems.map((fly) => (
        <FlyingItem key={fly.id} fly={fly} onComplete={handleFlyComplete} />
      ))}

      <div style={S.page}>
        <div style={S.inner}>
          {/* BREADCRUMB */}
          <nav style={S.breadcrumb}>
            <span
              className="breadcrumb-link"
              style={{ cursor: "pointer", color: "#888", transition: "color 0.2s" }}
              onClick={goHome}
            >
              Home
            </span>
            <span style={{ color: "#ccc" }}>›</span>
            <span style={{ color: "#111", fontWeight: 600 }}>{product.name}</span>
          </nav>

          {/* PRODUCT GRID */}
          <div
            className="product-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 1fr",
              gap: "0 28px",
              alignItems: "start",
            }}
          >
            {/* THUMBNAILS COL */}
            <div className="thumb-col" style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              {thumbnails.slice(0, 2).map((src, i) => (
                <div key={i} className="thumb-item" onClick={() => setActiveThumb(i)} style={S.thumb(activeThumb === i)}>
                  <img
                    src={src}
                    alt={`View ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* MAIN IMAGE COL */}
            <div className="product-image-wrapper" style={{ position: "relative" }}>
              {/* NEW DROP BADGE */}
              {product.tag && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 5,
                    background: NAVY,
                    color: "#fff",
                    padding: "7px 14px",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {product.tag}
                </div>
              )}

              {/* DISCOUNT BADGE */}
              {discount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: product.tag ? 52 : 16,
                    left: 16,
                    zIndex: 5,
                    background: "#CC3333",
                    color: "#fff",
                    padding: "5px 10px",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {discount}% OFF
                </div>
              )}

              <div style={{ touchAction: "pan-y" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <Image
                  className="main-product-img"
                  src={thumbnails[activeThumb]}
                  alt={product.name}
                  width={900}
                  height={1100}
                  priority
                  sizes="(max-width: 900px) 100vw, 45vw"
                  draggable={false}
                />
              </div>

              {/* THUMBNAIL DOTS (mobile) */}
              <div
                className="mobile-slider-dots"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 22,
                  marginBottom: 10,
                }}
              >
                {thumbnails.slice(0, 2).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    style={{
                      width: 14,
                      height: 14,
                      minWidth: 14,
                      minHeight: 14,
                      borderRadius: "50%",
                      border: activeThumb === i ? "2px solid #ffffff" : "none",
                      background: activeThumb === i ? NAVY : "#D9D9D9",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.25s ease",
                      boxShadow: activeThumb === i ? "0 0 0 1px rgba(0,0,0,0.12)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* INFO COL */}
            <div>
              {/* PRODUCT TITLE */}
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(28px, 5vw, 48px)",
                  lineHeight: 1.0,
                  letterSpacing: "0.03em",
                  color: "#0a0a0a",
                }}
              >
                {product.name}
              </h1>

              {/* SUBTITLE */}
              <p
                style={{
                  fontSize: 13,
                  color: "#888",
                  letterSpacing: "0.04em",
                  marginBottom: 18,
                  lineHeight: 1.5,
                }}
              >
                {product.subtitle || "Premium military-grade streetwear · 100% cotton"}
              </p>

              {/* RATING */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="13" height="13" viewBox="0 0 20 20">
                      <polygon
                        points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
                        fill={star <= 4 ? GOLD : "none"}
                        stroke={GOLD}
                        strokeWidth="1.5"
                      />
                    </svg>
                  ))}
                </div>
              </div>

              {/* PRICE ROW */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
                <span
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 34,
                    letterSpacing: "0.03em",
                    color: "#0a0a0a",
                  }}
                >
                  {product.price}
                </span>
                {product.oldPrice && (
                  <span
                    style={{
                      fontSize: 18,
                      color: "#bbb",
                      textDecoration: "line-through",
                      fontWeight: 400,
                    }}
                  >
                    {product.oldPrice}
                  </span>
                )}
                {discount > 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      background: "#FFF0F0",
                      color: "#CC3333",
                      padding: "4px 10px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div style={{ height: 1, background: "#EBEBEB", marginBottom: 10 }} />

              {/* COLOR SELECTOR */}
              {product.colors && product.colors.length > 0 && (
                <>
                  <div style={S.sectionLabel}>
                    Colour —{" "}
                    <span style={{ color: "#999", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                      {selectedColor || "Select a colour"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 15 }}>
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c)}
                        style={{
                          width: 30,
                          height: 30,
                          minWidth: 30,
                          minHeight: 30,
                          borderRadius: "50%",
                          background: COLOR_HEX_MAP[c] || "#E9E9E9",
                          border:
                            selectedColor === c ? `2px solid ${NAVY}` : c === "white" ? "1px solid #D9D9D9" : "1px solid transparent",
                          cursor: "pointer",
                          position: "relative",
                          transition: "transform 0.2s",
                          boxShadow: selectedColor === c ? `0 0 0 4px #ffffff, 0 0 0 6px ${NAVY}` : "none",
                          transform: selectedColor === c ? "scale(1.1)" : "scale(1)",
                        }}
                        aria-label={`Color ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div style={{ height: 1, background: "#EBEBEB", marginBottom: 10 }} />
                </>
              )}

              {/* SIZE SELECTOR */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ ...S.sectionLabel, marginBottom: 0 }}>Size</div>
                <button
                  onClick={toggleSizeChart}
                  style={{
                    fontSize: 12,
                    color: "#888",
                    textDecoration: "underline",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    letterSpacing: "0.04em",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    transition: "color 0.2s",
                  }}
                >
                  Size Chart {sizeChartOpen ? "▴" : "▾"}
                </button>
              </div>

              {/* SIZE CHART DROPDOWN */}
              <AnimatePresence>
                {sizeChartOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    style={{
                      overflow: "hidden",
                      border: "1px solid #EBEBEB",
                      borderRadius: 6,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        overflow: "hidden",
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      <thead>
                        <tr style={{ background: NAVY }}>
                          {SIZE_CHART_HEADERS.map((head) => (
                            <th
                              key={head}
                              style={{
                                padding: "14px 16px",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textAlign: "center",
                              }}
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SIZE_CHART_ROWS.map((row, index) => (
                          <tr key={index} style={{ background: index % 2 === 0 ? "#fff" : "#F3F4F8" }}>
                            {row.map((cell, i) => (
                              <td
                                key={i}
                                style={{
                                  padding: "16px",
                                  textAlign: "center",
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: "#1A2340",
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SIZE BUTTONS */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {ALL_SIZES.map((sz) => {
                  const oos = sz === "XS";
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      className="size-btn"
                      disabled={oos}
                      onClick={() => !oos && setSelectedSize(sz)}
                      style={S.sizeBtn(active, oos)}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              <div style={{ height: 1, background: "#EBEBEB", marginBottom: 10 }} />

              {/* QUANTITY SELECTOR */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={S.sectionLabel}>Qty</div>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #EBEBEB", borderRadius: 4, overflow: "hidden" }}>
                  <button
                    onClick={decQty}
                    style={{
                      width: 40,
                      height: 50,
                      border: "none",
                      background: "#fff",
                      fontSize: 20,
                      cursor: "pointer",
                      color: "#333",
                      transition: "background 0.15s",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f3f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    −
                  </button>
                  <div style={{ width: 44, textAlign: "center", fontSize: 15, fontWeight: 600, color: "#111" }}>{qty}</div>
                  <button
                    onClick={incQty}
                    style={{
                      width: 40,
                      height: 50,
                      border: "none",
                      background: "#fff",
                      fontSize: 20,
                      cursor: "pointer",
                      color: "#333",
                      transition: "background 0.15s",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f3f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ADD TO CART BUTTON */}
              <div className="btn-row" style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <button className="btn-cart" onClick={handleAddToCart} style={{ ...S.btnCart, background: NAVY }}>
                  {addedToCart ? "✓ Added!" : "Add to Cart"}
                </button>
              </div>

              {/* DELIVERY INFO BOX */}
              <div
                style={{
                  border: "1px solid #EBEBEB",
                  borderRadius: 6,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                  marginBottom: 10,
                }}
              >
                {DELIVERY_INFO.map((d) => (
                  <div
                    key={d.strong}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#555",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{d.icon}</span>
                    <span>
                      <strong style={{ color: "#111", fontWeight: 700 }}>{d.strong}</strong> — {d.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACCORDION */}
              {ACCORDION_DATA.map((acc) => (
                <div key={acc.id} style={{ borderTop: "1px solid #EBEBEB" }}>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#333",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {acc.title}
                    <span
                      style={{
                        fontSize: 18,
                        color: "#888",
                        transition: "transform 0.25s",
                        transform: activeAccordion === acc.id ? "rotate(45deg)" : "none",
                        display: "inline-block",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <AnimatePresence>
                    {activeAccordion === acc.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        style={{ overflow: "hidden" }}
                      >
                        <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, paddingBottom: 16, letterSpacing: "0.02em" }}>
                          {acc.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {/* final border */}
              <div style={{ borderTop: "1px solid #EBEBEB" }} />
            </div>
          </div>

          {/* YOU MAY ALSO LIKE */}
          {related.length > 0 && (
            <section style={{ marginTop: 80, paddingBottom: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
                <div style={{ width: 36, height: 2, background: GOLD }} />
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#888",
                    fontWeight: 700,
                  }}
                >
                  You May Also Like
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(32px,8vw,64px)",
                  lineHeight: 0.95,
                  letterSpacing: "0.02em",
                  marginBottom: 40,
                }}
              >
                <span style={{ color: NAVY }}>RELATED </span>
                <span style={{ color: GOLD }}>DROPS</span>
              </h2>

              <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
                {related.map((p) => (
                  <div key={p.id} className="related-card" onClick={() => router.push(`/product/${p.id}`)} style={{ cursor: "pointer" }}>
                    <div
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        background: "#F4F3F0",
                        paddingBottom: 0,
                        aspectRatio: "1 / 1.12",
                        borderBottom: "none",
                      }}
                    >
                      {p.tag && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            background: NAVY,
                            color: "#fff",
                            padding: "5px 10px",
                            fontSize: 10,
                            letterSpacing: "0.18em",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            zIndex: 5,
                          }}
                        >
                          {p.tag}
                        </div>
                      )}
                      <Image
                        src={p.images?.[p.defaultColor || "black"]?.back}
                        alt={p.name}
                        width={500}
                        height={600}
                        loading="lazy"
                        sizes="(max-width: 600px) 50vw, 25vw"
                      />
                    </div>
                    <h3
                      style={{
                        fontSize: 16,
                        color: "#111",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.name}
                    </h3>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>{p.price}</span>
                      {p.oldPrice && (
                        <span style={{ fontSize: 14, color: "#bbb", textDecoration: "line-through" }}>{p.oldPrice}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* CUSTOMER REVIEWS */}
        <section style={{ marginTop: 80, marginBottom: 80 }}>
          <CustomerReviews productId={product.id} />
        </section>

        {/* FOOTER STRIP */}
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
            © 2025 Prakumbh. India's Premium Streetwear.
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
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      <AddressModal
        open={addressOpen}
        onClose={closeAddressModal}
        cartItems={cartItems}
        setCartItems={setCartItems}
        setCartOpen={setCartOpen}
      />
    </>
  );
}