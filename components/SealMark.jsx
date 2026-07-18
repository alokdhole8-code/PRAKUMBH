'use client';
import { GOLD } from "@/app/data/products";

// ─── SIGNATURE MARK ────────────────────────────────────────────────────────
// The one recurring "signature" graphic for this redesign: a Rajmudra-style
// gold seal ring, echoed in the loader, the trust strip and section
// eyebrows. Purely decorative SVG, no props/state.
export default function SealMark({ size = 22 }) {
  return (
<svg
  width={size}
  height={size}
  viewBox="0 0 40 40"
  fill="none"
  aria-hidden="true"
  style={{
    width: `${size}px`,
    height: `${size}px`,
    display: "block",
    flexShrink: 0,
  }}
>
      <circle cx="20" cy="20" r="18" stroke={GOLD} strokeWidth="1.4" />
      <circle cx="20" cy="20" r="12.5" stroke={GOLD} strokeWidth="1" opacity="0.6" />
      <path
        d="M20 10 L23 18 L31 20 L23 22 L20 30 L17 22 L9 20 L17 18 Z"
        fill={GOLD}
      />
    </svg>
  );
}
