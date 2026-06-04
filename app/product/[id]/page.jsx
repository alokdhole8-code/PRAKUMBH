'use client';
 import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { products, GOLD, NAVY, LIGHT, BORDER } from "../../data/products";
import { motion, AnimatePresence } from "framer-motion";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { useCart } from "@/components/CartProvider";

import { handleBuyNow } from "@/lib/buyNow";


const EASE = [0.16, 1, 0.3, 1];

// ─── FLYING BAG ANIMATION COMPONENT ─────────────────────────────────────────
function FlyingItem({ fly, onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!fly || !ref.current) return;

    const el = ref.current;
    const { startX, startY, endX, endY } = fly;

    // Midpoint for bezier arc — curves upward between start and end
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 130;

    let start = null;
    const duration = 450;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function quadBezier(t, p0, p1, p2) {
      return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
    }

    function animate(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const rawT = Math.min(elapsed / duration, 1);
      const t = easeInOutCubic(rawT);

      const x = quadBezier(t, startX, midX, endX);
      const y = quadBezier(t, startY, midY, endY);

      const scale = 1 - t * 0.6;
      const opacity = rawT < 0.75 ? 1 : 1 - (rawT - 0.75) / 0.25;

      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      el.style.opacity = opacity;

      if (rawT < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete(fly.id);
      }
    }

    requestAnimationFrame(animate);
  }, [fly, onComplete]);

  if (!fly) return null;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 54,
        height: 54,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2.5px solid #fff",
        boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
        pointerEvents: "none",
        zIndex: 9999999,
        willChange: "transform, opacity",
        background: "#f4f3f0",
        transform: `translate3d(${fly.startX}px, ${fly.startY}px, 0) scale(1)`,
        opacity: 1,
      }}
    >
      <img
        src={fly.imgSrc}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        draggable="false"
      />
    </div>
  );
}

// ─── CART DRAWER — exact copy from homepage ─────────────────────────────────
function CartDrawer({
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
  setBuyNowProduct,
  addressOpen,
  setAddressOpen,
}) {

  const router = useRouter();
 
 

  const premiumInput = {
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
<img
  src={item.images?.[item.selectedColor || item.defaultColor || "black"]?.back}
  alt={item.name}
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
                              {item.selectedColor
                                ? `${item.selectedColor} · ${item.selectedSize || "M"}`
                                : "Black · M"}
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
                                  onClick={() =>
                                    setCartItems((prev) =>
                                      prev.map((ci) =>
                                        ci.id === item.id &&
ci.selectedColor === item.selectedColor &&
ci.selectedSize === item.selectedSize &&
ci.selectedColor === item.selectedColor &&
ci.selectedSize === item.selectedSize
                                          ? { ...ci, quantity: Math.max(1, (ci.quantity || 1) - 1) }
                                          : ci
                                      )
                                    )
                                  }
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
                                  onClick={() =>
                                    setCartItems((prev) =>
                                      prev.map((ci) =>
                                        ci.id === item.id &&
ci.selectedColor === item.selectedColor &&
ci.selectedSize === item.selectedSize &&
ci.selectedColor === item.selectedColor &&
ci.selectedSize === item.selectedSize
                                          ? { ...ci, quantity: (ci.quantity || 1) + 1 }
                                          : ci
                                      )
                                    )
                                  }
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
                                onClick={() =>
                                  setCartItems((prev) =>
                                    prev.filter(
  (ci) =>
    !(
      ci.id === item.id &&
      ci.selectedColor === item.selectedColor &&
      ci.selectedSize === item.selectedSize
    )
)
                                  )
                                }
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                               <svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#222"
  strokeWidth="2"
>
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
                    <span
                      style={{ fontSize: 34, fontWeight: 700, color: "#111" }}
                    >
                      ₹
                      {cartItems.reduce(
                        (t, item) =>
                          t +
                          Number(
                            item.price.replace("₹", "").replace(".00", "")
                          ) *
                            (item.quantity || 1),
                        0
                      )}
                      .00
                    </span>
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
  onClick={() => {
    setAddressOpen(true);
  }}
  
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
                  Have an account?{" "}
                  <span style={{ textDecoration: "underline" }}>Log in</span>{" "}
                  to check out faster.
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
}

// ─── SIZES CONFIG ────────────────────────────────────────────────────────────
const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_CHART = [
  { size: "XS", chest: "34–36", waist: "28–30", length: "27" },
  { size: "S",  chest: "36–38", waist: "30–32", length: "28" },
  { size: "M",  chest: "38–40", waist: "32–34", length: "29" },
  { size: "L",  chest: "40–42", waist: "34–36", length: "30" },
  { size: "XL", chest: "42–44", waist: "36–38", length: "31" },
  { size: "XXL",chest: "44–46", waist: "38–40", length: "32" },
];

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

 const {
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
} = useCart();
 
 
  const [barHidden, setBarHidden] = useState(false);

  // ── FLYING ANIMATION STATE ────────────────────────────────────────────────
  const [flyItems, setFlyItems] = useState([]);
  const [cartShaking, setCartShaking] = useState(false);

  const handleFlyComplete = useCallback((id) => {
    setFlyItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

 

  // ── PRODUCT STATE ─────────────────────────────────────────────────────────
  const product = products.find((p) => String(p.id) === String(params?.id)) || products[0];

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.defaultColor || "black"
  );

  const activeColor = selectedColor || product.defaultColor || "black";

  const thumbnails = [
    product.images?.[activeColor]?.back,
    product.images?.[activeColor]?.front,
  ].filter(Boolean);

const [selectedSize, setSelectedSize] = useState(null);
const [qty, setQty] = useState(1);

 
const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
const [addressOpen, setAddressOpen] = useState(false);

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [landmark, setLandmark] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");

const isFormValid =
  fullName.trim() &&
  phone.trim() &&
  address.trim() &&
  city.trim() &&
  pincode.trim();


  // ── SCROLL LISTENER (announcement bar hide) ───────────────────────────────
  useEffect(() => {
    const handle = () => setBarHidden(window.scrollY > 40);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const parsePrice = (str) =>
    Number((str || "0").replace(/[₹,.]/g, "").replace(".00", "")) || 0;

  const discount = product.oldPrice
    ? Math.round(
        ((parsePrice(product.oldPrice) - parsePrice(product.price)) /
          parsePrice(product.oldPrice)) *
          100
      )
    : 0;

  const validateSelection = () => {
    if (!selectedColor) {
      alert("Please select a color");
      return false;
    }
    if (!selectedSize) {
      alert("Please select a size");
      return false;
    }
    return true;
  };

  // ── FLYING ANIMATION TRIGGER ──────────────────────────────────────────────
  const triggerFlyAnimation = useCallback(() => {
    const imgEl = document.querySelector(".main-product-img");
    const cartEl = document.querySelector(".cart-icon-target");

    if (imgEl && cartEl) {
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();

      // Center of product image → center of cart icon, offset by half thumb size (27px)
      const startX = imgRect.left + imgRect.width / 2 - 27;
      const startY = imgRect.top + imgRect.height / 2 - 27;
      const endX = cartRect.left + cartRect.width / 2 - 27;
      const endY = cartRect.top + cartRect.height / 2 - 27;

      const flyId = Date.now() + Math.random();
      setFlyItems((prev) => [
        ...prev,
        {
          id: flyId,
          startX,
          startY,
          endX,
          endY,
          imgSrc: thumbnails[activeThumb],
        },
      ]);

      // Cart icon shake triggers ~50ms before animation ends
      setTimeout(() => {
        // setCartShaking(true);
        // setTimeout(() => setCartShaking(false), 600);
      }, 820);
    }
  }, [thumbnails, activeThumb]);

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    // Trigger flying bag animation
    triggerFlyAnimation();

    // Existing cart logic — unchanged
    setCartItems((prev) => {
      const exists = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );
      if (exists) {
        return prev.map((i) =>
          i.id === product.id &&
          i.selectedSize === selectedSize &&
          i.selectedColor === selectedColor
            ? { ...i, quantity: (i.quantity || 1) + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: qty,
          selectedColor,
          selectedSize,
        },
      ];
    });

    setAddedToCart(true);
setTimeout(() => {
  window.dispatchEvent(
    new Event("cartUpdated")
  );
}, 50);  };
 
  // ── RELATED PRODUCTS ──────────────────────────────────────────────────────
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  // ── STYLES ───────────────────────────────────────────────────────────────
  const S = {
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
    grid: {
      display: "grid",
      gridTemplateColumns: "72px 1fr 1fr",
      gap: "0 28px",
      alignItems: "start",
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
    mainImgWrap: {
      position: "relative",
 background: "#ffffff",
  border: "1px solid #ececec",
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        borderRadius: 8,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      aspectRatio: "auto",
      minHeight: "auto",
      cursor: "zoom-in",
    },
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
    btnBuy: {
      height: 54,
      border: "none",
      borderRadius: 4,
      background: "#0a0a0a",
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
  };

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
        .btn-cart:hover { background: #1a2e42 !important; transform: translateY(-1px); }
        .btn-buy:hover  { background: #1a1a1a !important; transform: translateY(-1px); }
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

      {/* Pass cartShaking to Navbar so cart icon can shake */}
      <Navbar
        barHidden={barHidden}
        setCartOpen={setCartOpen}
        cartItems={cartItems}
        cartShaking={cartShaking}
      />

 <CartDrawer
  cartOpen={cartOpen}
  setCartOpen={setCartOpen}
  cartItems={cartItems}
  setCartItems={setCartItems}
  setBuyNowProduct={setBuyNowProduct}
  addressOpen={addressOpen}
  setAddressOpen={setAddressOpen}
/>

      {/* ── FLYING ITEMS PORTAL ── */}
      {flyItems.map((fly) => (
        <FlyingItem key={fly.id} fly={fly} onComplete={handleFlyComplete} />
      ))}

      {/* TOAST */}
       

      <div style={S.page}>
        <div style={S.inner}>

          {/* BREADCRUMB */}
          <nav style={S.breadcrumb}>
            <span
              className="breadcrumb-link"
              style={{ cursor: "pointer", color: "#888", transition: "color 0.2s" }}
              onClick={() => router.push("/")}
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
            <div
              className="thumb-col"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 4,
              }}
            >
              {thumbnails.slice(0, 2).map((src, i) => (
                <motion.div
                  key={i}
                  className="thumb-item"
                  onClick={() => setActiveThumb(i)}
                  whileHover={{ opacity: 1 }}
                  style={S.thumb(activeThumb === i)}
                >
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
                </motion.div>
              ))}
            </div>

            {/* MAIN IMAGE COL */}
<div
  className="product-image-wrapper"
  style={{
    position: "sticky",
    top: 24,
  }}
>                {/* NEW DROP BADGE */}
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

<img
  className="main-product-img"
  src={thumbnails[activeThumb]}
  alt={product.name}
  loading="eager"
  decoding="async"
  draggable="false"
  style={{
    width: "100%",
    objectFit: "contain",
    display: "block",
  }}
/>

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
                      border:
                        activeThumb === i
                          ? "2px solid #ffffff"
                          : "none",
                      background:
                        activeThumb === i
                          ? NAVY
                          : "#D9D9D9",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.25s ease",
                      boxShadow:
                        activeThumb === i
                          ? "0 0 0 1px rgba(0,0,0,0.12)"
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* INFO COL */}
            <motion.div
              className="info-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
              style={{
                paddingLeft: 6,
                paddingTop: 10,
              }}
            >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
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
                    <span
                      style={{
                        color: "#999",
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      {selectedColor || "Select a colour"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
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
                          background:
                            c === "black"
                              ? "#000000"
                              : c === "blue"
                              ? "#256D85"
                              : c === "grey"
                              ? "#8E8E8E"
                              : "#E9E9E9",
                          border:
                            selectedColor === c
                              ? `2px solid ${NAVY}`
                              : c === "white"
                              ? "1px solid #D9D9D9"
                              : "1px solid transparent",
                          cursor: "pointer",
                          position: "relative",
                          transition: "transform 0.2s",
                          boxShadow:
                            selectedColor === c
                              ? `0 0 0 4px #ffffff, 0 0 0 6px ${NAVY}`
                              : "none",
                          transform:
                            selectedColor === c ? "scale(1.1)" : "scale(1)",
                        }}
                        aria-label={`Color ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div style={{ height: 1, background: "#EBEBEB", marginBottom: 10 }} />
                </>
              )}

              {/* SIZE SELECTOR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div style={{ ...S.sectionLabel, marginBottom: 0 }}>Size</div>
                <button
                  onClick={() => setSizeChartOpen(!sizeChartOpen)}
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
                          {["SIZE", "CHEST (IN)", "LENGTH (IN)", "SLEEVE (IN)"].map((head) => (
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
                        {[
                          ["S", "38", "26", "7.5"],
                          ["M", "40", "27", "8"],
                          ["L", "42", "28", "8.5"],
                          ["XL", "44", "30", "9"],
                          ["XXL", "46", "31", "9.5"],
                          ["3XL", "48", "31", "10"],
                          ["4XL", "50", "31", "11"],
                        ].map((row, index) => (
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
              <div
                style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}
              >
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                <div style={S.sectionLabel}>Qty</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1.5px solid #EBEBEB",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
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
                  <div
                    style={{
                      width: 44,
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {qty}
                  </div>
                  <button
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
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
<div
  className="btn-row"
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 10,
  }}
>
  <button
    className="btn-cart"
    onClick={handleAddToCart}
    style={S.btnCart}
  >
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
                {[
                  { icon: "📦", strong: "Free Delivery", text: "on orders above ₹999" },
                  { icon: "🚚", strong: "3–5 business days", text: "estimated delivery" },
                ].map((d) => (
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
                    <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>
                      {d.icon}
                    </span>
                    <span>
                      <strong style={{ color: "#111", fontWeight: 700 }}>
                        {d.strong}
                      </strong>{" "}
                      — {d.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACCORDION */}
              {[
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
              ].map((acc) => (
                <div key={acc.id} style={{ borderTop: "1px solid #EBEBEB" }}>
                  <button
                    onClick={() =>
                      setActiveAccordion(activeAccordion === acc.id ? null : acc.id)
                    }
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
                        <p
                          style={{
                            fontSize: 13,
                            color: "#777",
                            lineHeight: 1.7,
                            paddingBottom: 16,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {acc.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {/* final border */}
              <div style={{ borderTop: "1px solid #EBEBEB" }} />
            </motion.div>
          </div>

          {/* YOU MAY ALSO LIKE */}
          {related.length > 0 && (
            <section style={{ marginTop: 80, paddingBottom: 80 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 40,
                }}
              >
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

              <div
                className="related-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 24,
                }}
              >
                {related.map((p, i) => (
                <div
  key={p.id}
                    className="related-card"
                    
                    onClick={() => router.push(`/product/${p.id}`)}
                    style={{ cursor: "pointer" }}
                  >
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
                      <img
                        src={p.images?.[p.defaultColor || "black"]?.back}
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "12px",
                          display: "block",
                          transition: "transform 0.5s ease",
                        }}
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
                      <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>
                        {p.price}
                      </span>
                      {p.oldPrice && (
                        <span
                          style={{
                            fontSize: 14,
                            color: "#bbb",
                            textDecoration: "line-through",
                          }}
                        >
                          {p.oldPrice}
                        </span>
                      )}
                    </div>
                    </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}
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
          onClick={() => setAddressOpen(false)}
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
    gridTemplateColumns:
      window.innerWidth < 480
        ? "1fr"
        : "1fr 1fr",
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
          ₹{cartItems.reduce((total, item) => {
            return (
              total +
              Number(
                item.price.replace("₹", "").replace(".00", "")
              ) *
                (item.quantity || 1)
            );
          }, 0)}
        </strong>
      </div>

      {/* BUTTON */}
<button
  disabled={!isFormValid}
onClick={async () => {
      if (!isFormValid) return;

    const currentUser = JSON.parse(
  localStorage.getItem("prakumbh_current")
);

if (currentUser) {
  const users =
    JSON.parse(
      localStorage.getItem("prakumbh_users")
    ) || [];

  const userIndex = users.findIndex(
    (u) => u.id === currentUser.id
  );

  if (userIndex !== -1) {
    const orderData = {
      id: "ORD" + Date.now(),
      date: new Date().toISOString(),
      status: "Processing",

items: cartItems.map(item => ({
  ...item,
  image:
    item.images?.[
      item.selectedColor ||
      item.defaultColor ||
      "black"
    ]?.back || "",
})),
      total: cartItems.reduce(
        (total, item) =>
          total +
          Number(
            item.price
              .replace("₹", "")
              .replace(".00", "")
          ) *
            (item.quantity || 1),
        0
      ),

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

    localStorage.setItem(
      "prakumbh_users",
      JSON.stringify(users)
    );
  }
}

    const message = "Hi, I have placed an order. Please confirm.";

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
  quantity: cartItems.reduce(
    (t, i) => t + (i.quantity || 1),
    0
  ),

  amount: cartItems.reduce(
    (t, i) =>
      t +
      Number(
        i.price
          .replace("₹", "")
          .replace(".00", "")
      ) *
        (i.quantity || 1),
    0
  ),
};

const whatsappUrl =
  `https://wa.me/918766599895?text=${encodeURIComponent(message)}`;

const win = window.open(
  whatsappUrl,
  "_blank"
);
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
 
 
    setAddressOpen(false);
    setCartOpen(false);
    setCartItems([]);

    setFullName("");
    setPhone("");
    setAddress("");
    setLandmark("");
    setCity("");
    setPincode("");

   }}
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