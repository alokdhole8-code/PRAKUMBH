'use client';
import { memo } from "react";
import Image from "next/image";
import { GOLD } from "@/app/data/products";
import { INK } from "@/constants/colors";
import useIsMobile from "../hooks/useIsMobile";
import SealMark from "../components/SealMark";

// ─── MANIFESTO / BRAND STATEMENT ───────────────────────────────
// Cinematic full-bleed background with a large typographic statement.
// Static/presentational — no props, no state.
const Manifesto = memo(function Manifesto() {
  const isMobile = useIsMobile();
  return (
    <section
      style={{
        position: "relative",
        minHeight: isMobile ? 380 : 560,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: INK,
      }}
    >
      <Image
        src="/assets/shivaji.jpeg"
        quality={28}
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        style={{ objectFit: "cover", opacity: 0.55 }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,15,22,0.55) 0%, rgba(10,15,22,0.85) 100%)",
        }}
      />

      <div
         style={{
          position: "relative",
          maxWidth: 900,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <SealMark size={80} />
        </div>
        <p
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 5.5vw, 52px)",
            lineHeight: 1.15,
            letterSpacing: "0.01em",
            color: "#F7F3EA",
            marginBottom: 22,
          }}
        >
          NOT JUST CLOTHING —{" "}
          <span style={{ color: GOLD }}>A DECLARATION OF SWARAJYA.</span>
        </p>
        <p
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            letterSpacing: "0.08em",
            color: "rgba(247,243,234,0.75)",
            lineHeight: 1.7,
            textTransform: "uppercase",
          }}
        >
          Every stitch carries the discipline of the Mavalas and the
          sovereignty of a kingdom built on courage. Worn by those who refuse
          to be ordinary.
        </p>
      </div>
    </section>
  );
});

export default Manifesto;
