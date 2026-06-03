'use client';
import { useCart } from "@/components/CartProvider";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// remove this line completely
import { GOLD, NAVY } from "@/app/data/products";

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
function getUsers() {
  try {
    const raw = localStorage.getItem("prakumbh_users");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem("prakumbh_users", JSON.stringify(users));
  } catch {}
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("prakumbh_current");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && u.id && u.email ? u : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function getFullUser() {
  try {
    const current = getCurrentUser();
    if (!current) return null;
    const users = getUsers();
    return users.find((u) => u.id === current.id) || current;
  } catch {
    return null;
  }
}

function getOrders() {
  try {
    const full = getFullUser();
    if (!full) return [];
    return Array.isArray(full.orders) ? full.orders : [];
  } catch {
    return [];
  }
}

function doLogout() {
  try {
    localStorage.removeItem("prakumbh_current");
  } catch {}
}

// ─── ADDRESS HELPERS ──────────────────────────────────────────────────────────
function getAddresses(userId) {
  try {
    const raw = localStorage.getItem(`prakumbh_addresses_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveAddresses(userId, addresses) {
  try {
    localStorage.setItem(`prakumbh_addresses_${userId}`, JSON.stringify(addresses));
  } catch {}
}

// ─── WISHLIST HELPERS ─────────────────────────────────────────────────────────
function getWishlist(userId) {
  try {
    const raw = localStorage.getItem(`prakumbh_wishlist_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveWishlist(userId, items) {
  try {
    localStorage.setItem(`prakumbh_wishlist_${userId}`, JSON.stringify(items));
  } catch {}
}

const TABS = ["Overview", "Orders", "Wishlist", "Addresses", "Profile", "Security"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
   const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [mounted, setMounted] = useState(false);
const {
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
} = useCart();

 

  useEffect(() => {
    setMounted(true);
    try {
      if (!isLoggedIn()) {
        router.replace("/login");
        return;
      }
      const full = getFullUser();
      if (!full) {
        router.replace("/login");
        return;
      }
      setUser(full);
      setOrders(Array.isArray(full.orders) ? full.orders : []);
    } catch {
      router.replace("/login");
    }
  }, []);

 

  const handleLogout = useCallback(() => {
    try {
      doLogout();
      window.dispatchEvent(new Event("storage"));
    } catch {}
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(() => {
    try {
      const full = getFullUser();
      if (full) {
        setUser(full);
        setOrders(Array.isArray(full.orders) ? full.orders : []);
      }
    } catch {}
  }, []);

  if (!mounted) return null;
  if (!user) {
    return (
      <div
        style={{
          padding: "120px 20px",
          textAlign: "center",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 18,
          color: "#888",
          letterSpacing: "0.1em",
        }}
      >
        Loading…
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((w) => w[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const totalSpent = orders.reduce((sum, o) => {
    const n = parseFloat(String(o.total).replace(/[^0-9.]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const lastOrder =
    orders.length > 0
      ? [...orders].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Barlow Condensed', sans-serif; background: #fafafa; }
        .tab-btn { background: transparent; border: none; cursor: pointer; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-content { animation: fadeInUp 0.3s ease both; }
        .tabs-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .tabs-scroll::-webkit-scrollbar { display: none; }
        input:focus { outline: none; border-color: ${NAVY} !important; }
        textarea:focus { outline: none; border-color: ${NAVY} !important; }
        select:focus { outline: none; }
      `}</style>

      <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "60px",
    background: "#fff",
    borderBottom: "1px solid #e5e5e5",
    display: "flex",
    alignItems: "center",
    padding: "0 15px",
    zIndex: 9999,
  }}
>
  <button
    onClick={() => router.push("/shop")}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "5px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      color: "#111",
    }}
  >
    <span
      className="material-symbols-outlined"
      style={{ fontSize: "28px" }}
    >
      arrow_back
    </span>
    Back
  </button>
</div>

      <div
        style={{
          paddingTop: 60,
          minHeight: "100vh",
          background: "#fafafa",
          transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* ── HERO BAND ── */}
        <div
          style={{
            background: NAVY,
            padding: "44px clamp(20px,5vw,80px) 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* AVATAR */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: GOLD,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 26,
                color: "#fff",
                letterSpacing: "0.08em",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div style={{ width: 22, height: 1, background: GOLD }} />
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.3em",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Member Since {joinDate}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(26px,5vw,40px)",
                  letterSpacing: "0.06em",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {user.name}
              </h1>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.06em",
                  marginTop: 4,
                }}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              padding: "10px 22px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 17 }}
            >
              logout
            </span>
            Logout
          </button>
        </div>

        {/* ── TABS ── */}
        <div
          className="tabs-scroll"
          style={{
            background: "#fff",
            borderBottom: "1px solid #e8e8e8",
            padding: "0 clamp(20px,5vw,80px)",
            display: "flex",
            gap: 0,
            whiteSpace: "nowrap",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              className="tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "16px 20px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: activeTab === tab ? NAVY : "#888",
                borderBottom:
                  activeTab === tab
                    ? `2px solid ${GOLD}`
                    : "2px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div
          style={{
            padding: "40px clamp(20px,5vw,80px) 80px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {activeTab === "Overview" && (
            <div key="overview" className="tab-content">
              <OverviewTab
                user={user}
                orders={orders}
                totalSpent={totalSpent}
                lastOrder={lastOrder}
                setActiveTab={setActiveTab}
                router={router}
              />
            </div>
          )}
          {activeTab === "Orders" && (
            <div key="orders" className="tab-content">
              <OrdersSection orders={orders} router={router} />
            </div>
          )}
          {activeTab === "Wishlist" && (
            <div key="wishlist" className="tab-content">
              <WishlistSection userId={user.id} router={router} />
            </div>
          )}
          {activeTab === "Addresses" && (
            <div key="addresses" className="tab-content">
              <AddressesSection userId={user.id} />
            </div>
          )}
          {activeTab === "Profile" && (
            <div key="profile" className="tab-content">
              <ProfileSection user={user} onSave={refreshUser} />
            </div>
          )}
          {activeTab === "Security" && (
            <div key="security" className="tab-content">
              <SecuritySection user={user} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ user, orders, totalSpent, lastOrder, setActiveTab, router }) {
const stats = [
  {
    label: "Total Orders",
    value: orders.length,
    icon: "shopping_bag",
  },
  {
    label: "Total Spent",
    value: `₹${totalSpent.toLocaleString("en-IN")}`,
    icon: "payments",
  },
];
  return (
    <div>
      {/* STAT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              padding: "28px 24px",
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "#f0f4ff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 22, color: NAVY }}
              >
                {icon}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 28,
                  color: NAVY,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#888",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK LINKS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "View All Orders",
            icon: "receipt_long",
            action: () => setActiveTab("Orders"),
          },
          {
            label: "Edit Profile",
            icon: "person_edit",
            action: () => setActiveTab("Profile"),
          },
          {
            label: "Browse Shop",
            icon: "storefront",
            action: () => router.push("/shop"),
          },
        ].map(({ label, icon, action }) => (
          <button
            key={label}
            onClick={action}
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              padding: "20px 22px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              transition: "border-color 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#e8e8e8")
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: GOLD }}
            >
              {icon}
            </span>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: NAVY,
                fontWeight: 600,
              }}
            >
              {label}
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, color: "#ccc", marginLeft: "auto" }}
            >
              arrow_forward
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ORDERS SECTION ───────────────────────────────────────────────────────────
function OrdersSection({ orders, router }) {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (!orders || orders.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 56,
            color: "#e0e0e0",
            display: "block",
            marginBottom: 20,
          }}
        >
          shopping_bag
        </span>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 32,
            color: NAVY,
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          NO ORDERS YET
        </h2>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: "#888",
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}
        >
          Your order history will appear here once you make a purchase.
        </p>
        <button
          onClick={() => router.push("/shop")}
          style={{
            background: NAVY,
            color: "#fff",
            border: "none",
            padding: "14px 38px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
          }}
        >
          SHOP NOW
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* FILTER PILLS */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "7px 18px",
              background: filter === s ? NAVY : "#fff",
              color: filter === s ? "#fff" : "#555",
              border: `1px solid ${filter === s ? NAVY : "#e0e0e0"}`,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            padding: "48px",
            textAlign: "center",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: "#888",
            letterSpacing: "0.08em",
          }}
        >
          No orders with status "{filter}"
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sorted.map((order, idx) => (
            <OrderCard key={order.id || idx} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles = {
    Delivered: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    Processing: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Shipped: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    Cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const statusColor = statusStyles[order.status] || {
    bg: "#f5f5f5",
    color: "#555",
    border: "#e5e5e5",
  };

  const formattedDate = order.date
    ? new Date(order.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
      {/* HEADER */}
      <div
        style={{ padding: "24px", cursor: "pointer" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: expanded ? 18 : 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.2em",
                color: "#888",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Order #{order.id}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 14,
                color: "#555",
                letterSpacing: "0.04em",
              }}
            >
              {formattedDate}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                background: statusColor.bg,
                color: statusColor.color,
                border: `1px solid ${statusColor.border}`,
                padding: "5px 14px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {order.status || "Pending"}
            </span>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 20,
                color: "#aaa",
                transition: "transform 0.2s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              expand_more
            </span>
          </div>
        </div>

        {/* COLLAPSED PREVIEW */}
        {!expanded && Array.isArray(order.items) && order.items.length > 0 && (
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              color: "#888",
              marginTop: 8,
            }}
          >
            {order.items.map((i) => i.name || "Product").join(", ")} ·{" "}
            <strong style={{ color: NAVY }}>₹{order.total ?? 0}</strong>
          </div>
        )}
      </div>

      {/* EXPANDED */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: "20px 24px 24px",
          }}
        >
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {order.items.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 12, alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 66,
                      background: "#f4f4f4",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 15,
                        color: "#111",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.name || "Product"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 13,
                        color: "#888",
                      }}
                    >
                      Qty: {item.quantity ?? 1}
                    </div>
                    {item.size && (
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 12,
                          color: "#aaa",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Size: {item.size}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHIPPING ADDRESS */}
          {order.shippingAddress && (
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                padding: "14px 18px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Shipped To
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                }}
              >
                {[
                  order.shippingAddress.name,
                  order.shippingAddress.line1,
                  order.shippingAddress.line2,
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 16,
            }}
          >
            {order.trackingId && (
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 12,
                  color: "#888",
                  letterSpacing: "0.1em",
                }}
              >
                Tracking: {order.trackingId}
              </span>
            )}
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                color: NAVY,
                letterSpacing: "0.08em",
              }}
            >
              ₹{order.total ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WISHLIST SECTION ─────────────────────────────────────────────────────────
function WishlistSection({ userId, router }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWishlist(userId));
  }, [userId]);

  const removeItem = (productId) => {
    const updated = items.filter((i) => i.id !== productId);
    setItems(updated);
    saveWishlist(userId, updated);
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 56,
            color: "#e0e0e0",
            display: "block",
            marginBottom: 20,
          }}
        >
          favorite
        </span>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 32,
            color: NAVY,
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          YOUR WISHLIST IS EMPTY
        </h2>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            color: "#888",
            letterSpacing: "0.05em",
            marginBottom: 28,
          }}
        >
          Save items you love for later.
        </p>
        <button
          onClick={() => router.push("/shop")}
          style={{
            background: NAVY,
            color: "#fff",
            border: "none",
            padding: "14px 38px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
          }}
        >
          EXPLORE SHOP
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 20,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "4/5",
              background: "#f4f4f4",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => router.push(`/shop/${item.id}`)}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 40, color: "#ccc" }}
                >
                  image
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => removeItem(item.id)}
            title="Remove from wishlist"
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, color: "#dc2626" }}
            >
              delete
            </span>
          </button>
          <div style={{ padding: "14px 16px 16px" }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 15,
                color: "#111",
                letterSpacing: "0.04em",
                marginBottom: 4,
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 18,
                color: NAVY,
                letterSpacing: "0.06em",
              }}
            >
              ₹{item.price}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADDRESSES SECTION ────────────────────────────────────────────────────────
const EMPTY_ADDRESS = {
  id: null,
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

function AddressesSection({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    setAddresses(getAddresses(userId));
  }, [userId]);

  const persist = (updated) => {
    setAddresses(updated);
    saveAddresses(userId, updated);
  };

  const handleDelete = (id) => {
    persist(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id) => {
    persist(
      addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleFormSave = (data) => {
    if (data.id) {
      // editing
      const updated = addresses.map((a) => (a.id === data.id ? data : a));
      if (data.isDefault) {
        persist(updated.map((a) => ({ ...a, isDefault: a.id === data.id })));
      } else {
        persist(updated);
      }
    } else {
      // new
      const newAddr = {
        ...data,
        id: `addr_${Date.now()}`,
      };
      const updated = [...addresses, newAddr];
      if (newAddr.isDefault) {
        persist(updated.map((a) => ({ ...a, isDefault: a.id === newAddr.id })));
      } else {
        persist(updated);
      }
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            color: NAVY,
            letterSpacing: "0.06em",
          }}
        >
          Saved Addresses
        </h2>
        {!showForm && (
          <button
            onClick={handleAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: NAVY,
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 17 }}
            >
              add
            </span>
            Add Address
          </button>
        )}
      </div>

      {showForm ? (
        <AddressForm
          initial={editingAddress || EMPTY_ADDRESS}
          onSave={handleFormSave}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      ) : addresses.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 48,
              color: "#e0e0e0",
              display: "block",
              marginBottom: 16,
            }}
          >
            location_on
          </span>
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              color: "#888",
              letterSpacing: "0.06em",
            }}
          >
            No saved addresses yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                background: "#fff",
                border: `1px solid ${addr.isDefault ? GOLD : "#e8e8e8"}`,
                padding: "22px 24px",
                position: "relative",
              }}
            >
              {addr.isDefault && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    background: GOLD,
                    color: "#fff",
                    padding: "3px 10px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Default
                </span>
              )}
              {addr.label && (
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: GOLD,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {addr.label}
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 15,
                  color: "#111",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {addr.name}
              </div>
              {addr.phone && (
                <div
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 13,
                    color: "#888",
                    marginBottom: 8,
                  }}
                >
                  {addr.phone}
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.7,
                }}
              >
                {addr.line1}
                {addr.line2 && `, ${addr.line2}`}
                <br />
                {[addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => handleEdit(addr)}
                  style={{
                    background: "transparent",
                    border: "1px solid #e0e0e0",
                    padding: "6px 14px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#555",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    style={{
                      background: "transparent",
                      border: "1px solid #e0e0e0",
                      padding: "6px 14px",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 12,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#555",
                      cursor: "pointer",
                    }}
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #fecaca",
                    padding: "6px 14px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 12,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...initial });
  const [errors, setErrors] = useState({});

  const field = (key, label, placeholder = "", required = false, type = "text") => (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: errors[key] ? "#dc2626" : "#555",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          setErrors((er) => ({ ...er, [key]: "" }));
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 46,
          border: `1px solid ${errors[key] ? "#dc2626" : "#e0e0e0"}`,
          borderRadius: 2,
          padding: "0 14px",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 15,
          color: "#111",
          background: "#fafafa",
          transition: "border-color 0.2s",
        }}
      />
      {errors[key] && (
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            color: "#dc2626",
            marginTop: 4,
          }}
        >
          {errors[key]}
        </p>
      )}
    </div>
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.line1.trim()) e.line1 = "Address line 1 is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.pincode.trim()) e.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = "Enter a valid 6-digit pincode.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ ...form });
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        padding: "32px",
        maxWidth: 560,
      }}
    >
      <h3
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          color: NAVY,
          letterSpacing: "0.06em",
          marginBottom: 24,
        }}
      >
        {form.id ? "Edit Address" : "Add New Address"}
      </h3>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          {field("label", "Label", "Home / Office / Other")}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          {field("name", "Full Name", "John Doe", true)}
        </div>
        {field("phone", "Phone", "10-digit mobile number", false, "tel")}
        <div />
        <div style={{ gridColumn: "1 / -1" }}>
          {field("line1", "Address Line 1", "House no, Street", true)}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          {field("line2", "Address Line 2", "Landmark, Area")}
        </div>
        {field("city", "City", "Mumbai", true)}
        {field("state", "State", "Maharashtra", true)}
        {field("pincode", "Pincode", "400001", true)}
      </div>

      {/* DEFAULT CHECKBOX */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          marginBottom: 28,
        }}
      >
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            setForm((f) => ({ ...f, isDefault: e.target.checked }))
          }
          style={{ accentColor: NAVY, width: 16, height: 16 }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            color: "#555",
            letterSpacing: "0.05em",
          }}
        >
          Set as default address
        </span>
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handleSubmit}
          style={{
            height: 48,
            padding: "0 32px",
            background: NAVY,
            color: "#fff",
            border: "none",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            cursor: "pointer",
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
          }}
        >
          Save Address
        </button>
        <button
          onClick={onCancel}
          style={{
            height: 48,
            padding: "0 24px",
            background: "#fff",
            color: "#555",
            border: "1px solid #e0e0e0",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE SECTION ──────────────────────────────────────────────────────────
function ProfileSection({ user, onSave }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = useCallback(() => {
    setError("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    try {
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx].name = name.trim();
        users[idx].phone = phone.trim();
        saveUsers(users);
      }

      const current = getCurrentUser();
      if (current) {
        const updated = { ...current, name: name.trim(), phone: phone.trim() };
        localStorage.setItem("prakumbh_current", JSON.stringify(updated));
      }

      window.dispatchEvent(new Event("storage"));
      if (onSave) onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch {
      setError("Failed to save. Please try again.");
    }
  }, [name, phone, user.id, onSave]);

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const inputStyle = (hasError) => ({
    width: "100%",
    height: 50,
    border: `1px solid ${hasError ? "#dc2626" : "#e0e0e0"}`,
    borderRadius: 2,
    padding: "0 16px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 16,
    letterSpacing: "0.04em",
    color: "#111",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const readonlyStyle = {
    ...inputStyle(false),
    color: "#888",
    background: "#f5f5f5",
    cursor: "default",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        padding: "36px",
        maxWidth: 520,
      }}
    >
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          color: NAVY,
          letterSpacing: "0.06em",
          marginBottom: 28,
        }}
      >
        PROFILE INFO
      </h2>

      {/* FULL NAME */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: error ? "#dc2626" : "#555",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Full Name
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          style={inputStyle(!!error)}
          onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = error ? "#dc2626" : "#e0e0e0")
          }
        />
        {error && (
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              color: "#dc2626",
              marginTop: 5,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* PHONE */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#555",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9876543210"
          style={inputStyle(false)}
          onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
        />
      </div>

      {/* EMAIL (readonly) */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#555",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Email Address
        </label>
        <input value={user.email || ""} readOnly style={readonlyStyle} />
      </div>

      {/* MEMBER SINCE (readonly) */}
      <div style={{ marginBottom: 28 }}>
        <label
          style={{
            display: "block",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#555",
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Member Since
        </label>
        <input value={joinDate} readOnly style={readonlyStyle} />
      </div>

      <button
        onClick={handleSave}
        style={{
          height: 50,
          padding: "0 36px",
          background: saved ? "#16a34a" : NAVY,
          color: "#fff",
          border: "none",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
          transition: "background 0.3s",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {saved && (
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
            check_circle
          </span>
        )}
        {saved ? "SAVED" : "SAVE CHANGES"}
      </button>
    </div>
  );
}

// ─── SECURITY SECTION ─────────────────────────────────────────────────────────
function SecuritySection({ user }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwdStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#e0e0e0" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: "Too Weak", color: "#dc2626" },
      { label: "Weak", color: "#f97316" },
      { label: "Fair", color: "#eab308" },
      { label: "Strong", color: "#22c55e" },
      { label: "Very Strong", color: "#16a34a" },
    ];
    return { score, ...map[score] };
  };

  const strength = pwdStrength(newPwd);

  const handleChange = () => {
    const e = {};
    if (!currentPwd) e.currentPwd = "Enter your current password.";
    if (!newPwd || newPwd.length < 8)
      e.newPwd = "Password must be at least 8 characters.";
    if (newPwd !== confirmPwd) e.confirmPwd = "Passwords do not match.";

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    // Validate current password
    const users = getUsers();
    const found = users.find((u) => u.id === user.id);
    if (!found || found.password !== currentPwd) {
      setErrors({ currentPwd: "Current password is incorrect." });
      return;
    }

    // Save
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx].password = newPwd;
      saveUsers(users);
    }

    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setErrors({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputStyle = (key) => ({
    width: "100%",
    height: 50,
    border: `1px solid ${errors[key] ? "#dc2626" : "#e0e0e0"}`,
    borderRadius: 2,
    padding: "0 48px 0 16px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 16,
    letterSpacing: "0.04em",
    color: "#111",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s",
  });

  const PwdField = ({ label, value, onChange, showState, toggleShow, errorKey }) => (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: "block",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: errors[errorKey] ? "#dc2626" : "#555",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showState ? "text" : "password"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setErrors((er) => ({ ...er, [errorKey]: "" }));
          }}
          style={inputStyle(errorKey)}
          onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = errors[errorKey]
              ? "#dc2626"
              : "#e0e0e0")
          }
        />
        <button
          type="button"
          onClick={toggleShow}
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#aaa",
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {showState ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {errors[errorKey] && (
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 12,
            color: "#dc2626",
            marginTop: 4,
          }}
        >
          {errors[errorKey]}
        </p>
      )}
    </div>
  );

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        padding: "36px",
        maxWidth: 520,
      }}
    >
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          color: NAVY,
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        CHANGE PASSWORD
      </h2>
      <p
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          color: "#888",
          letterSpacing: "0.04em",
          marginBottom: 28,
        }}
      >
        Keep your account secure by using a strong password.
      </p>

      {success && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "14px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "#16a34a" }}
          >
            check_circle
          </span>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 14,
              color: "#16a34a",
              letterSpacing: "0.06em",
            }}
          >
            Password changed successfully!
          </span>
        </div>
      )}

      <PwdField
        label="Current Password"
        value={currentPwd}
        onChange={setCurrentPwd}
        showState={showCurrent}
        toggleShow={() => setShowCurrent((v) => !v)}
        errorKey="currentPwd"
      />

      <PwdField
        label="New Password"
        value={newPwd}
        onChange={setNewPwd}
        showState={showNew}
        toggleShow={() => setShowNew((v) => !v)}
        errorKey="newPwd"
      />

      {/* STRENGTH BAR */}
      {newPwd && (
        <div style={{ marginTop: -12, marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 5,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  background: i < strength.score ? strength.color : "#e0e0e0",
                  transition: "background 0.3s",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              color: strength.color,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {strength.label}
          </span>
        </div>
      )}

      <PwdField
        label="Confirm New Password"
        value={confirmPwd}
        onChange={setConfirmPwd}
        showState={showConfirm}
        toggleShow={() => setShowConfirm((v) => !v)}
        errorKey="confirmPwd"
      />

      <button
        onClick={handleChange}
        style={{
          height: 50,
          padding: "0 36px",
          background: NAVY,
          color: "#fff",
          border: "none",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
          lock
        </span>
        Update Password
      </button>
    </div>
  );
}