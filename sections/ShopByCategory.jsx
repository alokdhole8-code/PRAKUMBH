'use client';
import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GOLD, NAVY } from "@/app/data/products";
import { STONE } from "../constants/colors";
import { SHOP_CATEGORIES } from "@/constants/categories";
import useIsMobile from "../hooks/useIsMobile";

const ShopByCategory = memo(function ShopByCategory({ setPageLoading }) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const goToCategory = useCallback(
    (catId) => {
      setPageLoading(true);
      router.push(`/shop?category=${catId}`);
    },
    [router, setPageLoading]
  );

  return (
    <section
      style={{
        padding: isMobile ? "0px 16px" : "10px 40px",
        background: "#FFFFFF",
      }}
    >
      <div >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 14,
          }}
        >
           <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: STONE,
              fontWeight: 600,
            }}
          >
            The Edit
          </span>
         </div>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px,6vw,52px)",
            color: NAVY,
            letterSpacing: "0.02em",
          }}
        >
          SHOP BY CATEGORY
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 16 : 28,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {SHOP_CATEGORIES.map((cat, i) => (
<div
  key={cat.id}
             onClick={() => goToCategory(cat.id)}
            role="button"
            tabIndex={0}
            aria-label={`Shop ${cat.label}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToCategory(cat.id);
            }}
            className="category-card"
            style={{
              position: "relative",
              aspectRatio: "0.75",
              overflow: "hidden",
              borderRadius: 20,
              cursor: "pointer",
              boxShadow: "0 18px 40px rgba(13,27,42,0.14)",
            }}
          >
            <div
              className="category-card-img"
              style={{
                position: "absolute",
                inset: 0,
                transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
<Image
  src={cat.image}
  alt={cat.label}
  fill
  loading="lazy"
  quality={60}
  sizes="(max-width:768px) 50vw,33vw"
  style={{
    objectFit: "cover",
    objectPosition: cat.id === "unfiltered"
      ? "center top"
      : "center center",
  }}
/>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(10,15,22,0.82), rgba(10,15,22,0.08) 55%, rgba(10,15,22,0.02))",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 16,
                right: 16,
                textAlign: "center",
                color: "#fff",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 1,
                  background: GOLD,
                  margin: "0 auto 10px",
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  fontSize: isMobile ? 15 : 18,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                {cat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* scoped hover styles for the gold underline + zoom (visual only) */}
      <style>{`
        .category-card:hover .category-card-img { transform: scale(1.08); }
      `}</style>
    </section>
  );
});

export default ShopByCategory;
