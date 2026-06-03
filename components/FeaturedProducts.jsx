/**
 * PRAKUMBH — Featured Collection
 * Ultra-premium luxury Indian streetwear brand
 * Production-ready Next.js + Tailwind + Framer Motion component
 *
 * Usage: Drop into your Next.js App Router project.
 * Install deps: npm i framer-motion swiper
 * Add to tailwind.config.js fonts if using next/font or @import in globals.css:
 *   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Barlow:wght@300;400;500&display=swap');
 */

"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── DUMMY PRODUCT DATA ──────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "OBSIDIAN CARGO JACKET",
    slug: "obsidian-cargo-jacket",
    badge: "NEW",
    price: 18900,
    comparePrice: 24000,
    discount: 21,
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=90&fit=crop&crop=top",
    hoverImage:
      "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=90&fit=crop&crop=top",
    colors: ["#0D1B2A", "#C9A84C", "#8B7355", "#F8F8F6"],
    wishlisted: false,
  },
  {
    id: 2,
    name: "VOID OVERSIZED TEE",
    slug: "void-oversized-tee",
    badge: "BESTSELLER",
    price: 5400,
    comparePrice: null,
    discount: null,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=90&fit=crop&crop=top",
    hoverImage:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=90&fit=crop&crop=top",
    colors: ["#1a1a1a", "#F8F8F6", "#8B7355"],
    wishlisted: true,
  },
  {
    id: 3,
    name: "SOVEREIGN WIDE-LEG TROUSERS",
    slug: "sovereign-wide-leg",
    badge: "LIMITED",
    price: 12500,
    comparePrice: 15000,
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=90&fit=crop&crop=top",
    hoverImage:
      "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=600&q=90&fit=crop&crop=top",
    colors: ["#2C3E50", "#7F8C8D", "#0D1B2A"],
    wishlisted: false,
  },
  {
    id: 4,
    name: "RITUAL BOMBER",
    slug: "ritual-bomber",
    badge: "SALE",
    price: 14200,
    comparePrice: 21000,
    discount: 32,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=90&fit=crop&crop=top",
    hoverImage:
      "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&q=90&fit=crop&crop=top",
    colors: ["#0D1B2A", "#C9A84C", "#1a1a1a"],
    wishlisted: false,
  },
  {
    id: 5,
    name: "NOMAD UTILITY VEST",
    slug: "nomad-utility-vest",
    badge: "NEW",
    price: 9800,
    comparePrice: null,
    discount: null,
    image:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&q=90&fit=crop&crop=top",
    hoverImage:
      "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600&q=90&fit=crop&crop=top",
    colors: ["#6B5B45", "#0D1B2A", "#F8F8F6"],
    wishlisted: false,
  },
];

const BADGE_CONFIG = {
  NEW: { bg: "#0D1B2A", text: "#F8F8F6" },
  BESTSELLER: { bg: "#C9A84C", text: "#0D1B2A" },
  LIMITED: { bg: "#8B0000", text: "#F8F8F6" },
  SALE: { bg: "#2D4739", text: "#A8D5B5" },
};

const LUXURY_EASE = [0.16, 1, 0.3, 1];

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

function SectionHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-0 mb-14 md:mb-20"
    >
      {/* Left */}
      <div>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7, ease: LUXURY_EASE }}
          style={{ transformOrigin: "left" }}
          className="flex items-center gap-3 mb-3"
        >
          <span
            style={{
              display: "block",
              width: 36,
              height: 1.5,
              background: "#C9A84C",
            }}
          />
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              color: "#C9A84C",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            SS · 2025 · DROP I
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: LUXURY_EASE, delay: 0.1 }}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.35em",
            color: "#0D1B2A",
            opacity: 0.45,
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          Featured Collection
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: LUXURY_EASE, delay: 0.18 }}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(4rem, 9vw, 8.5rem)",
            lineHeight: 0.92,
            color: "#0D1B2A",
            letterSpacing: "0.02em",
          }}
        >
          PRAKUMBH
        </motion.h2>
      </div>

      {/* Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.3 }}
        className="flex-shrink-0 md:pb-3"
      >
        <ViewAllButton />
      </motion.div>
    </div>
  );
}

function ViewAllButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 0,
        textDecoration: "none",
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.28em",
          color: "#0D1B2A",
          fontWeight: 700,
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "color 0.3s ease",
          opacity: hovered ? 0.65 : 1,
        }}
      >
        View All Products
        <span
          style={{
            fontSize: "0.9rem",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.4s cubic-bezier(.16,1,.3,1)",
            display: "inline-block",
          }}
        >
          →
        </span>
      </span>
      {/* Underline */}
      <span
        style={{
          display: "block",
          height: 1,
          background: "#C9A84C",
          width: hovered ? "100%" : "0%",
          transition: "width 0.4s cubic-bezier(.16,1,.3,1)",
          marginTop: 3,
        }}
      />
    </a>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(product.wishlisted);
  const [activeColor, setActiveColor] = useState(0);

  const badge = BADGE_CONFIG[product.badge];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.85,
        ease: LUXURY_EASE,
        delay: index * 0.09,
      }}
      className="flex-shrink-0 w-full"
      style={{ position: "relative" }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer",
          transition: "transform 0.55s cubic-bezier(.16,1,.3,1)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
        }}
      >
        {/* IMAGE CONTAINER */}
        <div
          style={{
            position: "relative",
            aspectRatio: "3/4",
            overflow: "hidden",
            background: "#EBEBEA",
            boxShadow: hovered
              ? "0 32px 60px rgba(13,27,42,0.18), 0 8px 20px rgba(13,27,42,0.08)"
              : "0 4px 20px rgba(13,27,42,0.06)",
            transition: "box-shadow 0.55s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {/* Primary image */}
          <img
            src={product.image}
            alt={product.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.9s cubic-bezier(.16,1,.3,1), opacity 0.5s ease",
              opacity: hovered ? 0 : 1,
            }}
          />
          {/* Hover image */}
          <img
            src={product.hoverImage}
            alt={product.name + " alternate"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: hovered ? "scale(1.04)" : "scale(1.08)",
              transition: "transform 0.9s cubic-bezier(.16,1,.3,1), opacity 0.5s ease",
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(13,27,42,0.35) 0%, transparent 55%)",
              pointerEvents: "none",
            }}
          />

          {/* BADGE */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: badge.bg,
              color: badge.text,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.58rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "4px 10px",
              pointerEvents: "none",
            }}
          >
            {product.badge}
          </div>

          {/* WISHLIST */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setWishlisted((w) => !w);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(248,248,246,0.88)",
              border: "none",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              transition: "transform 0.3s ease, background 0.3s ease",
              transform: wishlisted ? "scale(1.1)" : "scale(1)",
            }}
            aria-label="Add to wishlist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={wishlisted ? "#0D1B2A" : "none"}
              stroke="#0D1B2A"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick add bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(13,27,42,0.88)",
              backdropFilter: "blur(8px)",
              padding: "13px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transform: hovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.45s cubic-bezier(.16,1,.3,1)",
            }}
          >
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.25em",
                color: "#F8F8F6",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Quick Add
            </span>
            <span style={{ color: "#C9A84C", fontSize: "0.7rem" }}>+</span>
          </div>
        </div>

        {/* CARD INFO */}
        <div style={{ paddingTop: 14, paddingBottom: 4 }}>
          {/* Color swatches */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            {product.colors.map((col, i) => (
              <button
                key={i}
                onClick={() => setActiveColor(i)}
                style={{
                  width: i === activeColor ? 14 : 11,
                  height: i === activeColor ? 14 : 11,
                  borderRadius: "50%",
                  background: col,
                  border:
                    i === activeColor
                      ? "2px solid #0D1B2A"
                      : "1.5px solid rgba(13,27,42,0.12)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                  outline: "none",
                }}
                aria-label={`Color ${i + 1}`}
              />
            ))}
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.62rem",
                color: "rgba(13,27,42,0.38)",
                letterSpacing: "0.06em",
                marginLeft: 2,
              }}
            >
              +{product.colors.length} colors
            </span>
          </div>

          {/* Product name */}
          <h3
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.92rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "#0D1B2A",
              textTransform: "uppercase",
              marginBottom: 6,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h3>

          {/* Price row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#0D1B2A",
                letterSpacing: "0.04em",
              }}
            >
              {formatINR(product.price)}
            </span>
            {product.comparePrice && (
              <>
                <span
                  style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(13,27,42,0.35)",
                    textDecoration: "line-through",
                    letterSpacing: "0.02em",
                  }}
                >
                  {formatINR(product.comparePrice)}
                </span>
                <span
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: "#C9A84C",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  −{product.discount}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MOBILE SWIPER SLIDER ─────────────────────────────────────────────────────

function MobileSlider() {
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = 72; // vw

  const scrollTo = (i) => {
    setCurrentIndex(i);
    if (sliderRef.current) {
      const el = sliderRef.current.children[i];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      }
    }
  };

  return (
    <div>
      {/* Scrollable row */}
      <div
        ref={sliderRef}
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "4px",
        }}
      >
        {PRODUCTS.map((p, i) => (
          <div
            key={p.id}
            style={{
              minWidth: `${cardWidth}vw`,
              maxWidth: `${cardWidth}vw`,
              scrollSnapAlign: "start",
              flexShrink: 0,
            }}
          >
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 20,
        }}
      >
        {PRODUCTS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            style={{
              width: i === currentIndex ? 24 : 8,
              height: 2,
              background: i === currentIndex ? "#0D1B2A" : "rgba(13,27,42,0.18)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.4s cubic-bezier(.16,1,.3,1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DESKTOP GRID ─────────────────────────────────────────────────────────────

function DesktopGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "20px",
      }}
    >
      {PRODUCTS.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

// ─── FEATURED PRODUCTS (ROOT) ────────────────────────────────────────────────

export default function FeaturedProducts() {
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Barlow:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .prakumbh-section {
          background: #F8F8F6;
           position: relative;
          overflow: hidden;
        }

        .prakumbh-inner {
          max-width: 1520px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* Grain overlay */
        .prakumbh-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022;
          pointer-events: none;
          z-index: 0;
        }

        .prakumbh-inner { position: relative; z-index: 1; }

        /* Decorative gold line */
        .gold-rule {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent);
          margin-bottom: 72px;
        }

        /* Responsive: tablet */
        @media (max-width: 1024px) {
          .prakumbh-inner { padding: 0 32px; }
        }

        /* Responsive: mobile */
        @media (max-width: 768px) {
          .prakumbh-section { padding: 72px 0 80px; }
          .prakumbh-inner { padding: 0 20px; }
          .gold-rule { margin-bottom: 48px; }
          .desktop-grid { display: none !important; }
          .mobile-slider { display: block !important; }
          /* hide scrollbar */
          .mobile-slider ::-webkit-scrollbar { display: none; }
        }

        /* Hide mobile on desktop */
        .mobile-slider { display: none; }
      `}</style>

      <section className="prakumbh-section">
        <div className="prakumbh-inner">
          {/* Gold divider */}
          <div className="gold-rule" />

          {/* Section header */}
          <SectionHeader />

          {/* Desktop grid */}
          <div className="desktop-grid">
            <DesktopGrid />
          </div>

          {/* Mobile slider */}
          <div className="mobile-slider">
            <MobileSlider />
          </div>

          {/* Footer row */}
          <FooterRow />
        </div>
      </section>
    </>
  );
}

function FooterRow() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: LUXURY_EASE, delay: 0.5 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 64,
        paddingTop: 28,
        borderTop: "1px solid rgba(13,27,42,0.08)",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <p
        style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "rgba(13,27,42,0.35)",
          fontWeight: 400,
          textTransform: "uppercase",
        }}
      >
        Free Shipping on Orders Above ₹3,000 · Easy Returns · COD Available
      </p>
      <div
        style={{
          display: "flex",
          gap: "4px",
          alignItems: "center",
        }}
      >
        {["●", "●", "●"].map((dot, i) => (
          <span
            key={i}
            style={{
              color: i === 1 ? "#C9A84C" : "rgba(13,27,42,0.15)",
              fontSize: "0.45rem",
            }}
          >
            {dot}
          </span>
        ))}
      </div>
    </motion.div>
  );
}