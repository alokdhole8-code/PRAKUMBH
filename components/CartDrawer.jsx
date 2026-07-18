'use client';
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { NAVY, GOLD } from "@/app/data/products";
import { EASE } from "@/constants/animations";

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

export default function CartDrawer({
  cartOpen,
  cartItems,
  isMobile,
  cartTotal,
  closeCart,
  handleDecreaseQty,
  handleIncreaseQty,
  handleRemoveItem,
  handleBuyNowClick,
}) {
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* OVERLAY */}
          <div
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
          <div
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
                      <div
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
                      </div>
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
