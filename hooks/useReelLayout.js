'use client';
import { useState, useEffect } from "react";

// Measures the wrapper via ResizeObserver and derives how many cards are
// visible (3 desktop / 2 tablet / 2 mobile) plus the exact card width in px
// for that breakpoint, so the marquee math (translate distance per card) is
// always pixel-accurate — no CSS % guesswork.
export default function useReelLayout(containerRef) {
  const [layout, setLayout] = useState({ visible: 3, cardWidth: 0, gap: 24 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const width = el.offsetWidth;
      if (!width) return;
      let visible = 3;
      let gap = 24;
if (width < 640) {
  visible = 2;
} else if (width < 1024) {
  visible = 3;
} else if (width < 1440) {
  visible = 5;
} else {
  visible = 6;
}
      const cardWidth = (width - gap * (visible - 1)) / visible;
      setLayout((prev) =>
        prev.visible === visible && Math.abs(prev.cardWidth - cardWidth) < 0.5
          ? prev
          : { visible, cardWidth, gap }
      );
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("orientationchange", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", compute);
    };
  }, [containerRef]);

  return layout;
}
