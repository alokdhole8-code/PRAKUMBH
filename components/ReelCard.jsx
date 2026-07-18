'use client';
import { memo, useCallback } from "react";
import { INK } from "@/constants/colors";

// Single reel card. Memoized on (src, width) so re-renders triggered by the
// marquee's array-rotation state update never touch cards whose props
// haven't changed — React just reorders the existing DOM nodes (same key =
// same underlying <video>, so playback is never interrupted or reloaded).
const ReelCard = memo(function ReelCard({ src, width, reelNumber, onOpen }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  return (
    <div
      className="reel-card gpu-layer"
      role="button"
      tabIndex={0}
      aria-label={`Instagram reel ${reelNumber} — open @prakumbhclothing on Instagram`}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
style={{
  position: "relative",
  flex: `0 0 ${width}px`,
  width,
  aspectRatio: "9 / 16",
  borderRadius: 24,
  overflow: "hidden",
  cursor: "pointer",
  background: INK,
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow:
    "0 22px 50px rgba(10,15,22,0.22), 0 4px 14px rgba(10,15,22,0.10)",
  userSelect: "none",
  WebkitUserSelect: "none",
}}
    >
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(10,15,22,0.5) 0%, rgba(10,15,22,0) 38%)",
          pointerEvents: "none",
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="1" fill="#fff" stroke="none" />
        </svg>
      </div>
    </div>
  );
});

export default ReelCard;
