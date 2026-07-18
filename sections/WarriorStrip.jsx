'use client';
import { memo } from "react";
import { NAVY } from "@/app/data/products";
import { INK, GOLD_SOFT } from "../constants/colors";

// Purely static markup with no props — memoizing means it never re-renders
// when parent state (cart, page loading, scroll bar, etc.) changes.
const WarriorStrip = memo(function WarriorStrip() {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${INK} 0%, ${NAVY} 100%)`,
        overflow: "hidden",
        height: 38,
        display: "flex",
        alignItems: "center",
        marginBottom: 0,
        position: "relative",
        borderTop: `1px solid ${GOLD_SOFT}`,
        borderBottom: `1px solid ${GOLD_SOFT}`,
      }}
    >
 

      {/* subtle repeating diagonal texture behind the marquee — decorative only */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 1px, transparent 14px)",
          pointerEvents: "none",
        }}
      />

<div
  style={{
    position: "relative",
    display: "inline-flex",
    whiteSpace: "nowrap",
    alignItems: "center",
    width: "max-content",
    animation: "warriorMarquee 20s linear infinite",
    willChange: "transform",
  }}
>
<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>
<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  JAI BHAVANI • JAI SHIVAJI
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  THE DREAM OF SWARAJYA LIVES FOREVER
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
</span>

<span
  style={{
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    paddingRight: "70px",
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: "0.04em",
  }}
>
  HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
</span>

      </div>
    </section>
  );
});

export default WarriorStrip;
