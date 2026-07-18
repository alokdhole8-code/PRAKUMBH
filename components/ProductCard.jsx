'use client';
import { useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { m } from "framer-motion";
import { NAVY, GOLD } from "@/app/data/products";
import { EASE } from "@/constants/animations";
import { GOLD_GLOW } from "../constants/colors";
import useIsMobile from "../hooks/useIsMobile";

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  setCartOpen,
  setCartItems,
  setPageLoading,
  badge, // NEW optional presentational prop — visual "NEW"/"BESTSELLER" ribbon only
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    product.defaultColor || "black"
  );

  const handleHoverStart = useCallback(() => setHovered(true), []);
  const handleHoverEnd = useCallback(() => setHovered(false), []);

  const goToProduct = useCallback(() => {
    setPageLoading(true);
    router.push(`/product/${product.id}`);
  }, [router, product.id, setPageLoading]);

  const handleKeyDownCard = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToProduct();
      }
    },
    [goToProduct]
  );

  // Memoized so selecting a color re-renders only what actually needs it,
  // and the function identity is stable for child click handlers.
  const handleSelectColor = useCallback((e, colorKey) => {
    e.stopPropagation();
    setSelectedColor(colorKey);
  }, []);

  const backImage = product.images?.[selectedColor]?.back;

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation();

      const cartProduct = {
        ...product,
        selectedColor,
        selectedSize: "M",
        quantity: 1,
        image:
          product.images?.[selectedColor]?.back ||
          product.images?.[product.defaultColor || "black"]?.back,
      };

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.id === product.id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === "M"
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + 1,
          };
          return updated;
        }

        return [...prev, cartProduct];
      });

      setCartOpen(true);
    },
    [product, selectedColor, setCartItems, setCartOpen]
  );

  // Colour keys rarely change (only when `product` changes), so avoid
  // recomputing Object.keys(...) on every hover/color-selection re-render.
  const colorKeys = useMemo(
    () => Object.keys(product.images || {}),
    [product.images]
  );

  return (
<div
  onClick={goToProduct}
  onKeyDown={handleKeyDownCard}
  role="button"
  tabIndex={0}
  aria-label={`View ${product.name}`}
  onMouseEnter={handleHoverStart}
  onMouseLeave={handleHoverEnd}
      style={{
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          background: "#f4f1ea",
          marginBottom: 14,
          boxShadow: hovered
            ? "0 22px 40px rgba(13,27,42,0.16)"
            : "0 8px 20px rgba(13,27,42,0.06)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {badge && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 5,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(10,15,22,0.85)",
              backdropFilter: "blur(6px)",
              color: GOLD,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              border: `1px solid ${GOLD_GLOW}`,
            }}
          >
            {badge}
          </div>
        )}

        <div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Image
            src={backImage}
            alt={product.name}
            width={600}
            height={700}
             sizes="(max-width:640px) 50vw,
(max-width:1024px) 33vw,
25vw"
            quality={28}
decoding="async"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
        </div>

        {/* ADD TO CART */}
        {!isMobile && (
          <m.button
            initial={{ y: 100 }}
            animate={{ y: hovered ? 0 : 100 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 14,
              height: 54,
              borderRadius: 10,
              border: "none",
              background: "#0D1B2A",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.14em",
              cursor: "pointer",
              boxShadow: "0 12px 26px rgba(13,27,42,0.35)",
            }}
          >
            ADD TO CART
          </m.button>
        )}
      </div>

      {/* INFO */}
      <div>
        <h3
          style={{
            fontSize: 19,
            lineHeight: 1.4,
            marginBottom: 8,
            color: "#111",
            fontWeight: 500,
          }}
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#111",
              lineHeight: 1,
            }}
          >
            {product.price}
          </span>

          <span
            style={{
              fontSize: 15,
              color: "#a8a196",
              textDecoration: "line-through",
            }}
          >
            {product.oldPrice}
          </span>
        </div>

        {/* COLORS */}
        <div
          className="shop-category-grid"
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {colorKeys.map((colorKey, i) => (
            <div
              key={i}
              onClick={(e) => handleSelectColor(e, colorKey)}
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
                width: 18,
                height: 18,
                borderRadius: "50%",
                background:
                  colorKey === "black"
                    ? "#111"
                    : colorKey === "blue"
                    ? "#2563EB"
                    : colorKey === "grey"
                    ? "#6B7280"
                    : "#F5F5F5",
                boxShadow:
                  selectedColor === colorKey
                    ? `0 0 0 2px #fff, 0 0 0 4px ${NAVY}`
                    : colorKey === "white"
                    ? "0 0 0 1px #ccc"
                    : "0 0 0 1px #dcdcdc",
                transform: selectedColor === colorKey ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
