'use client';
import { memo, useState, useRef, useCallback, useEffect } from "react";
import { NAVY } from "@/app/data/products";
import { PARCHMENT, STONE, GOLD } from "../constants/colors";
import { REELS, IG_URL } from "../constants/reels";
import useReelLayout from "../hooks/useReelLayout";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import ReelCard from "../components/ReelCard";

// ── The marquee itself ───────────────────────────────────────────────────────
// Technique: exactly REELS.length DOM nodes exist at all times (no
// duplicated arrays). A single `order` array (state) holds the current
// left-to-right sequence of reel indices. Every frame, requestAnimationFrame
// nudges a translate3d() offset applied directly to the track's DOM node
// (imperative — no React re-render per frame, so it stays at 60fps). The
// moment that offset reaches exactly one card-width, the first entry of
// `order` is rotated to the end (a real state update — cheap, since it just
// reorders 7 items) and the offset is compensated by the same amount, so the
// rotation is visually seamless: nothing jumps, nothing blanks, nothing
// restarts. Because array order — not video src — drives position, React
// keeps reusing the same <video> DOM nodes (stable key = reel path), so
// playback continuity is preserved across the rotation.
const InstagramGallery = memo(function InstagramGallery() {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const { visible, cardWidth, gap } = useReelLayout(wrapperRef);
  const reducedMotion = usePrefersReducedMotion();

  const [order, setOrder] = useState(() => REELS.map((_, i) => i));

  const itemWidth = cardWidth + gap;

  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const momentumRafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const lastDragXRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const velocityRef = useRef(0);

  const SPEED = 38; // px / second, gentle Apple/Netflix-style drift

  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`;
    }
  }, []);

  const rotateForward = useCallback(() => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const next = prev.slice(1);
      next.push(prev[0]);
      return next;
    });
  }, []);

  const rotateBackward = useCallback(() => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const next = prev.slice(0, prev.length - 1);
      next.unshift(prev[prev.length - 1]);
      return next;
    });
  }, []);

  // Re-apply the (unchanged) pixel offset after every order-driven re-render
  // so the rotated DOM never flashes at transform:none for a frame.
  useEffect(() => {
    applyTransform();
  }, [order, applyTransform]);

  // Continuous auto-scroll loop.
  useEffect(() => {
    if (reducedMotion || !itemWidth || Number.isNaN(itemWidth)) return;
    lastTimeRef.current = null;

    const step = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;

      if (!pausedRef.current && !draggingRef.current) {
        offsetRef.current -= SPEED * dt;
        if (offsetRef.current <= -itemWidth) {
          offsetRef.current += itemWidth;
          rotateForward();
        } else {
          applyTransform();
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [itemWidth, reducedMotion, rotateForward, applyTransform]);

  // Desktop hover pause / resume.
  const handleMouseEnter = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
  }, []);

  // Pointer-based drag (mobile finger drag + desktop click-drag), with
  // rotation kept in sync mid-drag so dragging can never run out of cards.
  const handlePointerDown = useCallback(
    (e) => {
      if (!itemWidth || Number.isNaN(itemWidth)) return;
      draggingRef.current = true;
      movedRef.current = false;
      pausedRef.current = true;

      const x = e.clientX;
      dragStartXRef.current = x;
      dragStartOffsetRef.current = offsetRef.current;
      lastDragXRef.current = x;
      lastDragTimeRef.current = performance.now();
      velocityRef.current = 0;

      if (momentumRafRef.current) {
        cancelAnimationFrame(momentumRafRef.current);
        momentumRafRef.current = null;
      }
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [itemWidth]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingRef.current || !itemWidth) return;
      const x = e.clientX;
      const dx = x - dragStartXRef.current;
      if (Math.abs(dx) > 4) movedRef.current = true;

      const now = performance.now();
      const dt = now - lastDragTimeRef.current;
      if (dt > 0) velocityRef.current = (x - lastDragXRef.current) / dt;
      lastDragXRef.current = x;
      lastDragTimeRef.current = now;

      offsetRef.current = dragStartOffsetRef.current + dx;

      while (offsetRef.current <= -itemWidth) {
        offsetRef.current += itemWidth;
        dragStartOffsetRef.current += itemWidth;
        rotateForward();
      }
      while (offsetRef.current >= itemWidth) {
        offsetRef.current -= itemWidth;
        dragStartOffsetRef.current -= itemWidth;
        rotateBackward();
      }
      applyTransform();
    },
    [itemWidth, rotateForward, rotateBackward, applyTransform]
  );

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    let v = velocityRef.current * 1000; // px/sec
    const maxV = 1400;
    v = Math.max(-maxV, Math.min(maxV, v));
    const friction = 0.94;

    const momentumStep = () => {
      if (Math.abs(v) < 12 || !itemWidth) {
        pausedRef.current = false;
        momentumRafRef.current = null;
        return;
      }
      offsetRef.current += v / 60;
      v *= friction;

      while (offsetRef.current <= -itemWidth) {
        offsetRef.current += itemWidth;
        rotateForward();
      }
      while (offsetRef.current >= itemWidth) {
        offsetRef.current -= itemWidth;
        rotateBackward();
      }
      applyTransform();
      momentumRafRef.current = requestAnimationFrame(momentumStep);
    };

    momentumRafRef.current = requestAnimationFrame(momentumStep);
  }, [itemWidth, rotateForward, rotateBackward, applyTransform]);

  const openProfile = useCallback(() => {
    if (movedRef.current) return; // was a drag, not a tap/click
    window.open(IG_URL, "_blank", "noopener,noreferrer");
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!itemWidth) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        offsetRef.current += itemWidth;
        rotateForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rotateBackward();
      }
    },
    [itemWidth, rotateForward, rotateBackward]
  );

  const viewportWidth =
    itemWidth && !Number.isNaN(itemWidth)
      ? visible * cardWidth + (visible - 1) * gap
      : "100%";

  return (
    <section
      style={{
        background: PARCHMENT,
        padding: "clamp(0px,6vw,0px) 0 clamp(0px,9vw,110px)",
      }}
      aria-label="Instagram reels gallery"
    >
      <div style={{ width: "95%", maxWidth: 1700, margin: "0 auto" }}>
        <div style={{ marginBottom: 34, textAlign: "center" }}>
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
              Follow The Movement
            </span>
           </div>
<h2
  onClick={() =>
    window.open(
      "https://www.instagram.com/prakumbhclothing",
      "_blank",
      "noopener,noreferrer"
    )
  }
  style={{
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "clamp(40px,9vw,80px)",
    color: NAVY,
    letterSpacing: "0.01em",
    cursor: "pointer",
    transition: "color .25s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
  onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
>
  @PRAKUMBHCLOTHING
</h2>
        </div>

        <div
          ref={wrapperRef}
          role="group"
          tabIndex={0}
          aria-label="Instagram reels carousel — use arrow keys to navigate, opens Instagram profile on select"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
style={{
  width: "100%",
  margin: "0 auto",
  overflow: "hidden",
}}
        >
          <div
            ref={trackRef}
            className="gpu-layer"
            style={{
              display: "flex",
              gap,
              transform: "translate3d(0,0,0)",
            }}
          >
            {order.map((reelIdx) => (
              <ReelCard
                key={reelIdx}
                src={REELS[reelIdx]}
                width={cardWidth || 1}
                reelNumber={reelIdx + 1}
                onOpen={openProfile}
              />
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
@keyframes warriorMarquee {
  from {
    transform: translate3d(0,0,0);
  }

  to {
    transform: translate3d(-50%,0,0);
  }
}
`}</style>
    </section>
  );
});

export default InstagramGallery;
