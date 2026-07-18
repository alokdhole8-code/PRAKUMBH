// ─── EASE ────────────────────────────────────────────────────────────────────
export const EASE = [0.16, 1, 0.3, 1];

// Shared "reveal on scroll" motion preset used across new + restyled
// sections so entrances feel consistent rather than ad hoc.
export const REVEAL = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.45, ease: EASE },
};
