'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
import { GOLD, NAVY } from "@/app/data/products";
import { isLoggedIn, getOrders } from "@/utils/auth";

const STATUS_STYLES = {
  Delivered: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Processing: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  Shipped:    { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  Cancelled:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [barHidden, setBarHidden] = useState(false);
  const [orders, setOrders] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setOrders(getOrders());
  }, []);

  useEffect(() => {
    const handleScroll = () => setBarHidden(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Barlow Condensed', sans-serif; background: #fafafa; }
        .group:hover .group-hover\\:w-full { width: 100% !important; }
      `}</style>

      <AnnouncementBar hidden={barHidden} />
      <Navbar
  barHidden={barHidden}
  setCartOpen={() => {}}
  cartItems={[]}
/>

      <div
        style={{
          paddingTop: barHidden ? 56 : 92,
          minHeight: "100vh",
          background: "#fafafa",
          transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* PAGE HEADER */}
        <div style={{ background: NAVY, padding: "44px clamp(20px,5vw,80px) 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <div style={{ width: 28, height: 1, background: GOLD }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 600 }}>
              Your Account
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(34px,6vw,56px)", letterSpacing: "0.06em", color: "#fff", lineHeight: 1 }}>
            ORDER HISTORY
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em", marginTop: 8 }}>
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        {/* BREADCRUMB */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "12px clamp(20px,5vw,80px)", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => router.push("/account")}
            style={{ background: "transparent", border: "none", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.1em", color: "#888", cursor: "pointer", textTransform: "uppercase" }}
          >
            Account
          </button>
          <span style={{ color: "#ccc", fontSize: 12 }}>›</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.1em", color: NAVY, textTransform: "uppercase", fontWeight: 600 }}>
            Orders
          </span>
        </div>

        {/* ORDERS LIST */}
        <div style={{ padding: "36px clamp(20px,5vw,80px) 80px", maxWidth: 900, margin: "0 auto" }}>
          {orders.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                padding: "80px 40px",
                textAlign: "center",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#e0e0e0", display: "block", marginBottom: 20 }}>
                receipt_long
              </span>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: NAVY, letterSpacing: "0.06em", marginBottom: 12 }}>
                NO ORDERS YET
              </h2>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "#888", letterSpacing: "0.05em", marginBottom: 30, maxWidth: 340, margin: "0 auto 30px" }}>
                You haven't placed any orders yet. Start shopping and your orders will appear here.
              </p>
              <button
                onClick={() => router.push("/shop")}
                style={{
                  background: NAVY,
                  color: "#fff",
                  border: "none",
                  padding: "14px 40px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                }}
              >
                SHOP NOW
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {orders.map((order) => {
                const st = STATUS_STYLES[order.status] || { bg: "#f5f5f5", color: "#555", border: "#e5e5e5" };
                return (
                  <div
                    key={order.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e8e8",
                      overflow: "hidden",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {/* ORDER HEADER */}
                    <div
                      style={{
                        background: "#f9f9f9",
                        borderBottom: "1px solid #e8e8e8",
                        padding: "16px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 3 }}>Order ID</div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, color: "#111", fontWeight: 600 }}>#{order.id}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 3 }}>Placed On</div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, color: "#111" }}>
                            {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", marginBottom: 3 }}>Total</div>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: NAVY, letterSpacing: "0.06em" }}>₹{order.total}</div>
                        </div>
                      </div>
                      <span
                        style={{
                          background: st.bg,
                          color: st.color,
                          border: `1px solid ${st.border}`,
                          padding: "5px 14px",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 12,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          borderRadius: 2,
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* ITEMS */}
                    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 60, height: 76, background: "#f4f4f4", flexShrink: 0, overflow: "hidden" }}>
                            {item.image && (
                              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: "#111", letterSpacing: "0.04em", marginBottom: 4 }}>
                              {item.name}
                            </div>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: "#888", letterSpacing: "0.04em" }}>
                              Qty: {item.quantity} · {item.color || "Black"} · {item.size || "M"}
                            </div>
                          </div>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 600, color: "#111" }}>
                            {item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}