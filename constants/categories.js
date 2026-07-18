// ─── DATA ────────────────────────────────────────────────────────────────────
// Module-level constants are created once at import time (not per-render),
// so no extra memoization is needed for these arrays.
export const SHOP_CATEGORIES = [
  {
    id: "unfiltered",
    label: "UNTITLED",
    image: "/assets/unfilteredd.jpeg",
  },
  {
    id: "shivaji",
    label: "CREATIVE GRAPHICS",
    image: "/assets/shivaji.jpeg",
  },
  {
    id: "swarajya",
    label: "FESTIVALS",
    image: "/assets/fest.jpeg",
  },
];

// NOTE: the original `categories` array (T-Shirt, Polo T-Shirts, ...) was
// declared but never referenced anywhere in the component tree. Removing
// dead code trims parse/compile work and bundle size with zero UI impact.

export const NEW_ARRIVAL_IDS = [
  "fearless",
  "legacy-never-dies",
  "rise-to-victory",
  "the-vanguard",
  "ranaragini",
  "strength",
];

// ─── TRUST / USP STRIP ────────────────────────────────────────────────────
// Static, presentational only. Simple inline SVG icons so no new icon
// package dependency is introduced.
export const TRUST_ITEMS = [
  {
    label: "Free Shipping",
    sub: "On every order, pan-India",
    icon: (
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7zM6.5 19a2 2 0 100-4 2 2 0 000 4zM17.5 19a2 2 0 100-4 2 2 0 000 4z" />
    ),
  },
  {
    label: "Premium Cotton",
    sub: "Heavyweight, built to last",
    icon: <path d="M8 3c1 2 1 3-1 5s-3 3-3 6a4 4 0 004 4h8a4 4 0 004-4c0-3-1-4-3-6s-2-3-1-5c-2 1-3 2-4 2s-2-1-4-2z" />,
  },
{
  label: "Made for Legacy",
  sub: "Inspired by Swarajya",
  icon:<path d="M12 2L5 5v6c0 5 3.5 9 7 11 3.5-2 7-6 7-11V5l-7-3z" />,
},
{
  label: "High Quality Prints",
  sub: "Fade Resistant Colors",
  icon: <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zm7 9l.8 2.2L22 15l-2.2.8L19 18l-.8-2.2L16 15l2.2-.8L19 12zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14z" />,
},
];

// ─── LOOKBOOK — "AS WORN BY WARRIORS" ────────────────────────────────────────
// Editorial-style image grid. Reuses existing brand imagery — no new assets.
export const LOOKBOOK_IMAGES = [
  "/assets/new02.webp",
  "/assets/unfilteredd.jpeg",
  "/assets/new03.webp",
  "/assets/fest.jpeg",
];

// ─── TESTIMONIALS (placeholder data) ─────────────────────────────────────────
// Clearly-marked dummy reviews — no real customer names or quotes.
export const TESTIMONIALS = [
  {
    quote:
      "Placeholder review — fabric quality felt premium and the print held up after several washes.",
    author: "Verified Buyer",
  },
  {
    quote:
      "Placeholder review — fit was true to size and delivery was quicker than expected.",
    author: "Verified Buyer",
  },
  {
    quote:
      "Placeholder review — the design detail on the back print is the standout for me.",
    author: "Verified Buyer",
  },
];
