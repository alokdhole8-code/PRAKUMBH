'use client';
import { memo } from "react";
import { m } from "framer-motion";
import { NAVY } from "@/app/data/products";
import { PARCHMENT, HAIRLINE, STONE } from "../constants/colors";
import { TRUST_ITEMS } from "../constants/categories";
import useIsMobile from "../hooks/useIsMobile";

// ─── TRUST / USP STRIP ────────────────────────────────────────────────────
const TrustStrip = memo(function TrustStrip() {
  const isMobile = useIsMobile();
  return (
    <m.section
       style={{
        background: PARCHMENT,
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
        padding: isMobile ? "22px 16px" : "26px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 18 : 20,
        }}
      >
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke={NAVY}
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              {item.icon}
            </svg>
            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  color: NAVY,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </div>
              {!isMobile && (
                <div style={{ fontSize: 12, color: STONE, marginTop: 2 }}>
                  {item.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </m.section>
  );
});

export default TrustStrip;
