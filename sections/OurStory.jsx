'use client';
import { memo, useCallback } from "react";
import Image from "next/image";
import { GOLD, NAVY } from "@/app/data/products";
import { PARCHMENT, STONE, GOLD_SOFT } from "../constants/colors";
import useIsMobile from "../hooks/useIsMobile";

const OurStory = memo(function OurStory() {
  const isMobile = useIsMobile();

  const goToShop = useCallback(() => {
    window.location.href = "/shop";
  }, []);

  if (isMobile === null) return null;

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: isMobile ? "0px 10px" : "60px 40px",
      }}
    >
<div
  style={{
    maxWidth: 1300,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gridTemplateAreas: isMobile
      ? `"content"
         "image"`
      : `"image content"`,
    gap: isMobile ? 40 : 90,
    textAlign: isMobile ? "center" : "left",
    alignItems: "center",
  }}
>
        {/* IMAGE */}
<div
  style={{
    gridArea: "image",
  }}
>
<div
  style={{
    position: "relative",
    width: "100%",
    height: isMobile ? "320px" : "540px",
    borderRadius: 26,
    overflow: "hidden",
    background: "#F0EADB",
    boxShadow: "0 30px 70px rgba(10,15,22,0.18)",
    border: `1px solid ${GOLD_SOFT}`,
  }}
>
            <Image
              src="/assets/our-story.jpeg"
              quality={28}
              alt="Our Story"
              fill
              loading="lazy"
              sizes="(max-width:768px) 100vw, 50vw"
style={{
  objectFit: "cover",
}}
            />
            {/* Golden Glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(13,27,42,0.3), transparent 45%)",
                pointerEvents: "none",
                borderRadius: 24,
              }}
            />
          </div>
        </div>

        {/* CONTENT */}
<div>
          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-start",
              alignItems: "center",
              gap: 20,
              marginBottom: 16,
            }}
          >
             <span
              style={{
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: STONE,
                fontWeight: 600,
              }}
            >
              Our Legacy
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px,8vw,92px)",
              lineHeight: 0.94,
              marginBottom: 26,
            }}
          >
            <span style={{ color: NAVY }}>OUR </span>
            <span style={{ color: GOLD }}>STORY</span>
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.85,
              color: "#4A4438",
              marginBottom: 34,
            }}
          >
            Prakumbh was born from the spirit of Hindavi Swarajya and the
            timeless legacy of Chhatrapati Shivaji Maharaj. Every design
            carries the courage of the Mavalas, the pride of Maharashtra and
            the stories of warriors who shaped history.
          </p>

          <button
            onClick={goToShop}
            style={{
              height: 56,
              padding: "0 34px",
              borderRadius: 10,
              border: "none",
              background: "#0D1B2A",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              letterSpacing: "0.12em",
              boxShadow: "0 14px 30px rgba(13,27,42,0.25)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 18px 36px rgba(13,27,42,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 14px 30px rgba(13,27,42,0.25)";
            }}
          >
            EXPLORE COLLECTION →
          </button>
        </div>
      </div>
    </section>
  );
});

export default OurStory;
