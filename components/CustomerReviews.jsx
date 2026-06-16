"use client";

/**
 * CustomerReviews.jsx
 * ────────────────────────────────────────────────────────────────
 * Drop this component into your Product Detail Page BELOW the
 * Related Products section and ABOVE the Footer.
 *
 * Usage:
 *   import CustomerReviews from "@/components/CustomerReviews";
 *   ...
 *   <RelatedProducts />
 *   <CustomerReviews productId={product.id} />
 *   <Footer />
 *
 * Requires: framer-motion  (npm i framer-motion)
 * ────────────────────────────────────────────────────────────────
 */

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════
   DESIGN TOKENS  –  Navy / Gold / White
══════════════════════════════════════════════ */
const T = {
  navy:       "#0B1628",
  navyMid:    "#152340",
  navyLight:  "#1E3054",
  gold:       "#C9A84C",
  goldLight:  "#E2C06E",
  goldPale:   "#F5EDD6",
  white:      "#FFFFFF",
  offwhite:   "#F8F7F4",
  muted:      "#8A95A3",
  border:     "rgba(201,168,76,0.18)",
  cardBg:     "rgba(255,255,255,0.97)",
  shadow:     "0 4px 32px rgba(11,22,40,0.10)",
  shadowHover:"0 8px 48px rgba(11,22,40,0.18)",
  radius:     "16px",
  radiusSm:   "10px",
};

/* ══════════════════════════════════════════════
   SEED DATA  –  shown when no localStorage data
══════════════════════════════════════════════ */
 
/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const LS_KEY = (pid) => `reviews_${pid}`;

function loadReviews(productId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY(productId));
    return raw ? JSON.parse(raw) : SEED_REVIEWS.map((r) => ({ ...r, productId }));
  } catch {
    return [];
  }
}

function saveReviews(productId, reviews) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY(productId), JSON.stringify(reviews));
  } catch {}
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m} month${m > 1 ? "s" : ""} ago`;
  return `${Math.floor(m / 12)} year${Math.floor(m / 12) > 1 ? "s" : ""} ago`;
}

const AVATAR_PALETTE = [
  "#1E3054","#C9A84C","#2D5016","#7C3AED","#B45309",
  "#0369A1","#BE185D","#065F46",
];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[h];
}

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════ */

/* Star renderer */
function Stars({ value, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || value) : value;
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          style={{
            fontSize: size,
            cursor: interactive ? "pointer" : "default",
            color: n <= display ? T.gold : "#D1D5DB",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* Rating bar row */
function RatingBar({ label, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: T.muted, width: 42, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 7, background: "#E8E6E0", borderRadius: 99, overflow: "hidden" }}>
        <div
           style={{ height: "100%", background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`, borderRadius: 99 }}
        />
      </div>
      <span style={{ fontSize: 12, color: T.muted, width: 32, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
    </div>
  );
}

/* Avatar */
function Avatar({ name, size = 44 }) {
  const bg = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
      color: "#fff", fontWeight: 700, fontSize: size * 0.36,
      border: `2px solid ${T.border}`,
    }}>
      {initials(name) || "?"}
    </div>
  );
}

/* Image lightbox */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(11,22,40,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, cursor: "zoom-out",
        }}
      >
        <motion.img
          src={src}
          alt="Review photo"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "90vw", maxHeight: "90vh",
            objectFit: "contain", borderRadius: T.radius,
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            cursor: "default",
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "fixed", top: 20, right: 24,
            background: "rgba(255,255,255,0.12)", border: "none",
            color: "#fff", width: 40, height: 40, borderRadius: "50%",
            cursor: "pointer", fontSize: 20, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
          aria-label="Close"
        >×</button>
</div>
    </AnimatePresence>
  );
}

/* Single review card */
function ReviewCard({
  review,
  currentUser,
  onHelpful,
  onImageClick,
  isMostHelpful,
  onDelete
}) {
  return (
    <div
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background: T.cardBg,
        borderRadius: T.radius,
        boxShadow: "none",
        border: isMostHelpful ? `1.5px solid ${T.gold}` : `1px solid ${T.border}`,
        padding: "24px 26px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isMostHelpful && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          background: "#000",
          color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "4px 12px", borderBottomLeftRadius: 10,
          letterSpacing: 0.8,
        }}>
          ✦ MOST HELPFUL
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <Avatar name={review.customerName} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, color: T.navy, fontSize: 15 }}>{review.customerName}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#000",
              border: `1px solid ${T.gold}`, borderRadius: 4,
              padding: "1px 7px", letterSpacing: 0.6,
            }}>✓ VERIFIED</span>
{true && (  <button
    onClick={() => onDelete(review.id)}
    style={{
      marginLeft: "auto",
      border: "none",
      background: "#fee2e2",
      color: "#b91c1c",
      padding: "5px 10px",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 11,
      fontWeight: 700,
    }}
  >
    Delete
  </button>
)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <Stars value={review.rating} size={14} />
            <span style={{ fontSize: 12, color: T.muted }}>{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p style={{
        color: "#374151", lineHeight: 1.75, fontSize: 14,
        margin: "0 0 16px", fontStyle: "italic",
      }}>
        "{review.comment}"
      </p>

      {/* Photos */}
      {review.images?.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {review.images.map((src, i) => (
            <div
              key={i}
              onClick={() => onImageClick(src)}
              style={{
                width: 72, height: 72, borderRadius: T.radiusSm,
                overflow: "hidden", cursor: "zoom-in",
                border: `2px solid ${T.border}`,
                flexShrink: 0,
              }}
            >
              <img
                src={src} alt=""
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.3s", display: "block" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      )}

      {/* Helpful */}
      <button
  disabled={
    typeof window !== "undefined" &&
    localStorage.getItem(
      `helpful_${review.productId}_${review.id}`
    )
  }
  onClick={() => onHelpful(review.id)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: `1px solid ${T.border}`,
          borderRadius: 99, padding: "5px 14px",
          cursor: "pointer", color: T.muted, fontSize: 12,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.gold;
          e.currentTarget.style.color = T.gold;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.muted;
        }}
      >
        {typeof window !== "undefined" &&
localStorage.getItem(
  `helpful_${review.productId}_${review.id}`
)
  ? `✓ Helpful · ${review.helpful}`
  : `👍 Helpful · ${review.helpful}`}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   WRITE A REVIEW FORM
══════════════════════════════════════════════ */
function ReviewForm({ productId, onSubmit }) {
  const [name, setName]       = useState("");
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages]   = useState([]);   // base64 strings
  const [success, setSuccess] = useState(false);
  const [errors, setErrors]   = useState({});
  const fileRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - images.length);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImages((prev) => [...prev, ev.target.result].slice(0, 5));
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!rating) e.rating = "Please select a rating";
    if (!comment.trim()) e.comment = "Please write a review";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
const review = {
  id: Date.now(),
  productId,
  customerName: name.trim(),
  ownerName: name.trim(),
  rating,
  comment: comment.trim(),
  images,
  helpful: 0,
  createdAt: new Date().toISOString(),
};

localStorage.setItem(
  "reviewUserName",
  name.trim()
);


    onSubmit(review);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName(""); setRating(0); setComment(""); setImages([]);
    }, 2800);
  };

  const inputStyle = (hasErr) => ({
    width: "100%", padding: "12px 16px",
    borderRadius: T.radiusSm,
    border: `1.5px solid ${hasErr ? "#EF4444" : T.border}`,
    outline: "none", fontSize: 14, color: T.navy,
    background: T.white, boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  });

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: "center", padding: "48px 24px",
          background: T.cardBg, borderRadius: T.radius,
          border: `1.5px solid ${T.gold}`,
          boxShadow: "none",
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h3 style={{ color: T.navy, margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>
          Thank you for your review!
        </h3>
        <p style={{ color: T.muted, margin: 0 }}>Your experience helps other customers choose with confidence.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.cardBg, borderRadius: T.radius,
        border: `1px solid ${T.border}`, boxShadow: "none",
        padding: "32px 28px",
      }}
    >
      <h3 style={{ color: T.navy, margin: "0 0 24px", fontSize: 20, fontWeight: 700 }}>
        Write a Review
      </h3>

      <div style={{ display: "grid", gap: 18 }}>
        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 6, letterSpacing: 0.5 }}>
            YOUR NAME *
          </label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            placeholder="e.g. Rahul Sharma"
            style={inputStyle(errors.name)}
            onFocus={(e) => (e.target.style.borderColor = T.gold)}
            onBlur={(e) => (e.target.style.borderColor = errors.name ? "#EF4444" : T.border)}
          />
          {errors.name && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.name}</p>}
        </div>

        {/* Rating */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 8, letterSpacing: 0.5 }}>
            YOUR RATING *
          </label>
          <Stars value={rating} size={32} interactive onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: "" })); }} />
          {errors.rating && <p style={{ color: "#EF4444", fontSize: 11, margin: "6px 0 0" }}>{errors.rating}</p>}
        </div>

        {/* Comment */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 6, letterSpacing: 0.5 }}>
            YOUR REVIEW *
          </label>
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setErrors((p) => ({ ...p, comment: "" })); }}
            placeholder="How did you like this T-shirt? Share your experience..."
            rows={4}
            style={{
              ...inputStyle(errors.comment),
              resize: "vertical", minHeight: 110, lineHeight: 1.7,
            }}
            onFocus={(e) => (e.target.style.borderColor = T.gold)}
            onBlur={(e) => (e.target.style.borderColor = errors.comment ? "#EF4444" : T.border)}
          />
          {errors.comment && <p style={{ color: "#EF4444", fontSize: 11, margin: "4px 0 0" }}>{errors.comment}</p>}
        </div>

        {/* Photo upload */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 8, letterSpacing: 0.5 }}>
            ADD PHOTOS (max 5)
          </label>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />

          {images.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                border: `2px dashed ${T.gold}`, borderRadius: T.radiusSm,
                background: T.goldPale, padding: "12px 20px",
                cursor: "pointer", color: "#000", fontWeight: 600,
                fontSize: 13, transition: "all 0.2s",
              }}
            >
              📷 Upload Photos
            </button>
          )}

          {images.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {images.map((src, i) => (
                <div key={i} style={{ position: "relative", width: 76, height: 76 }}>
                  <img
                    src={src} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover",
                      borderRadius: T.radiusSm, border: `2px solid ${T.border}` }}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    style={{
                      position: "absolute", top: -6, right: -6,
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#EF4444", color: "#fff", border: "none",
                      cursor: "pointer", fontSize: 12, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
            color: "#000", border: "none", borderRadius: T.radiusSm,
            padding: "14px 28px", fontWeight: 700, fontSize: 14,
            cursor: "pointer", letterSpacing: 0.6,
            boxShadow: `0 4px 20px rgba(11,22,40,0.25)`,
            transition: "transform 0.15s, box-shadow 0.15s",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(11,22,40,0.3)`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 20px rgba(11,22,40,0.25)`; }}
        >
          Publish Review →
        </button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   CUSTOMER PHOTOS GALLERY
══════════════════════════════════════════════ */
function PhotoGallery({ photos, onImageClick }) {
  const scrollRef = useRef();

  if (!photos.length) return null;

  return (
    <div>
      <h3 style={{ color: T.navy, fontSize: 20, fontWeight: 700, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
        📸 Customer Photos
        <span style={{ fontSize: 13, color: T.muted, fontWeight: 400 }}>({photos.length})</span>
      </h3>
      <div
        ref={scrollRef}
        style={{
          display: "flex", gap: 14,
          overflowX: "auto", paddingBottom: 8,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {photos.map((src, i) => (
          <div
            key={i}
             onClick={() => onImageClick(src)}
            style={{
              flexShrink: 0, width: 160, height: 160,
              borderRadius: T.radius, overflow: "hidden",
              cursor: "zoom-in", boxShadow: "none",
              border: `2px solid ${T.border}`,
              scrollSnapAlign: "start",
            }}
          >
            <img
              src={src} alt={`Customer photo ${i + 1}`}
              loading="lazy"
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                transition: "transform 0.4s ease",
                display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function CustomerReviews({ productId = "default" }) {
  const [reviews, setReviews]       = useState([]);
  const [lightbox, setLightbox]     = useState(null);
  const [sort, setSort]             = useState("latest");
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [mounted, setMounted]       = useState(false);
const [currentUser, setCurrentUser] = useState("");
  // Hydrate from localStorage after mount
useEffect(() => {
  setMounted(true);
  setReviews(loadReviews(productId));

  const user = localStorage.getItem("reviewUserName");
  if (user) {
    setCurrentUser(user);
  }
}, [productId]);
  const addReview = useCallback(
    (review) => {
      setReviews((prev) => {
        const next = [review, ...prev];
        saveReviews(productId, next);
        return next;
      });
      setShowForm(false);
    },
    [productId]
  );

const markHelpful = useCallback(
  (id) => {
    const voteKey = `helpful_${productId}_${id}`;

    // already voted?
    if (localStorage.getItem(voteKey)) {
      return;
    }

    setReviews((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? { ...r, helpful: r.helpful + 1 }
          : r
      );

      saveReviews(productId, next);

      // save vote
      localStorage.setItem(voteKey, "true");

      return next;
    });
  },
  [productId]
);

const deleteReview = useCallback(
  (id) => {
    const ok = window.confirm("Delete this review?");
    if (!ok) return;

    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveReviews(productId, next);
      return next;
    });
  },
  [productId]
);

  /* ── Analytics ── */
  const analytics = useMemo(() => {
    if (!reviews.length) return null;
    const total = reviews.length;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    const dist = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return { star, pct: Math.round((count / total) * 100) };
    });
    const recommended = reviews.filter((r) => r.rating >= 4).length;
    const recPct = Math.round((recommended / total) * 100);
    const withPhotos = reviews.filter((r) => r.images?.length > 0).length;
    return { avg, total, dist, recPct, withPhotos };
  }, [reviews]);

  /* ── All customer photos ── */
  const allPhotos = useMemo(
    () => reviews.flatMap((r) => r.images ?? []),
    [reviews]
  );

  /* ── Most helpful ── */
  const mostHelpfulId = useMemo(() => {
    if (!reviews.length) return null;
    return reviews.reduce((best, r) => (r.helpful > (best?.helpful ?? -1) ? r : best), null)?.id;
  }, [reviews]);

  /* ── Filtered + sorted ── */
  const visible = useMemo(() => {
    let list = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "highest": list.sort((a, b) => b.rating - a.rating); break;
      case "lowest":  list.sort((a, b) => a.rating - b.rating); break;
      case "photos":  list = list.filter((r) => r.images?.length > 0); break;
      default:        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [reviews, sort, search]);

  if (!mounted) return null; // SSR guard

  /* ═══ RENDER ═══ */
  return (
    <section
      style={{
        background: T.offwhite,
        padding: "72px 0 80px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Inject hide-scrollbar globally */}
      <style>{`
        *::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 48, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}
        >
          <div>
<p style={{
  color: "#000",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 2,
  margin: "0 0 8px"
}}>
  CUSTOMER VOICES
</p>
            <h2 style={{ color: T.navy, fontSize: 34, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              Reviews & Photos
            </h2>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              background: "#000",
               color: "#fff", border: "none", borderRadius: T.radiusSm,
              padding: "12px 24px", fontWeight: 700, fontSize: 13,
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: `0 4px 16px rgba(201,168,76,0.35)`,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            {showForm ? "✕ Close" : "✍️ Write a Review"}
          </button>
        </motion.div>

        {/* ── Empty State ── */}
        {!reviews.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center", padding: "72px 24px",
              background: T.cardBg, borderRadius: T.radius,
              border: `1px solid ${T.border}`, marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>⭐</div>
            <h3 style={{ color: T.navy, fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>
              No Reviews Yet
            </h3>
            <p style={{ color: T.muted, maxWidth: 360, margin: "0 auto 24px" }}>
              Be the first customer to review this product and share your photos.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#000",
                color: "#fff", border: "none", borderRadius: T.radiusSm,
                padding: "14px 28px", fontWeight: 700, fontSize: 14,
                cursor: "pointer",
              }}
            >
              Write First Review
            </button>
          </motion.div>
        )}

        {/* ── Review Form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: 40 }}
            >
              <ReviewForm productId={productId} onSubmit={addReview} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Analytics + Rating Bars ── */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 32,
              background: T.cardBg,
              borderRadius: T.radius,
              border: `1px solid ${T.border}`,
              boxShadow: "none",
              padding: "32px 36px",
              marginBottom: 40,
              alignItems: "center",
            }}
          >
            {/* Big number */}
            <div style={{ textAlign: "center", paddingRight: 32, borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 64, fontWeight: 800, color: T.navy, lineHeight: 1 }}>
                {analytics.avg}
              </div>
              <Stars value={Math.round(Number(analytics.avg))} size={20} />
              <p style={{ color: T.muted, fontSize: 12, margin: "8px 0 0" }}>
                {analytics.total} review{analytics.total !== 1 ? "s" : ""}
              </p>
              <div style={{ marginTop: 14, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
<div style={{ color: "#000", fontWeight: 700, fontSize: 18 }}>
  {analytics.recPct}%
</div>                  <div style={{ color: T.muted, fontSize: 10, letterSpacing: 0.5 }}>RECOMMEND</div>
                </div>
                <div style={{ textAlign: "center" }}>
<div style={{ color: "#000", fontWeight: 700, fontSize: 18 }}>
  {analytics.withPhotos}
</div>
                  <div style={{ color: T.muted, fontSize: 10, letterSpacing: 0.5 }}>WITH PHOTOS</div>
                </div>
              </div>
            </div>

            {/* Bars */}
            <div>
              {analytics.dist.map(({ star, pct }) => (
                <RatingBar key={star} label={`${star} ★`} pct={pct} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Customer Photos ── */}
        {allPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: T.cardBg, borderRadius: T.radius,
              border: `1px solid ${T.border}`, boxShadow: "none",
              padding: "28px 28px 24px",
              marginBottom: 40,
            }}
          >
            <PhotoGallery photos={allPhotos} onImageClick={setLightbox} />
          </motion.div>
        )}

        {/* ── Search + Sort toolbar ── */}
        {reviews.length > 0 && (
          <div style={{
            display: "flex", gap: 12, alignItems: "center",
            marginBottom: 28, flexWrap: "wrap",
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }}>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews…"
                style={{
                  width: "100%", padding: "10px 14px 10px 38px",
                  borderRadius: T.radiusSm, border: `1.5px solid ${T.border}`,
                  fontSize: 13, color: T.navy, background: T.white,
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = T.gold)}
                onBlur={(e) => (e.target.style.borderColor = T.border)}
              />
            </div>

            {/* Sort */}
            {[
              { value: "latest",  label: "Latest"   },
              { value: "highest", label: "Top Rated" },
              { value: "lowest",  label: "Low Rated" },
              { value: "photos",  label: "With Photos" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                style={{
                  padding: "9px 16px", borderRadius: 99,
                  border: `1.5px solid ${sort === opt.value ? T.gold : T.border}`,
                  background: sort === opt.value ? T.goldPale : T.white,
                  color: sort === opt.value ? T.navy : T.muted,
                  fontWeight: sort === opt.value ? 700 : 400,
                  fontSize: 12, cursor: "pointer",
                  transition: "all 0.2s", flexShrink: 0,
                  fontFamily: "inherit",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Review Cards grid ── */}
        {visible.length > 0 ? (
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
<>              {visible.map((review) => (
<ReviewCard
  key={review.id}
  review={review}
  currentUser={currentUser}
  onHelpful={markHelpful}
  onImageClick={setLightbox}
  onDelete={deleteReview}
  isMostHelpful={review.id === mostHelpfulId && review.helpful > 0}
/>
              ))}
</>
          </motion.div>
        ) : reviews.length > 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
            No reviews match your search.
          </div>
        ) : null}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}