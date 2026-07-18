// Centralised price parsing so the same logic isn't duplicated (and re-parsed)
// in three different places (cart drawer total, address modal total, order
// payload amount).
export function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const n = Number(String(priceStr).replace("₹", "").replace(".00", ""));
  return Number.isFinite(n) ? n : 0;
}
