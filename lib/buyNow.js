export function handleBuyNow({
  setBuyNowProduct,
  setAddressOpen,
  cartItems,
}) {
  setBuyNowProduct({
    name: "Cart Order",
    items: cartItems,
  });

  setAddressOpen(true);
}