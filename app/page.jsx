"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import Navbar, { AnnouncementBar } from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AddressModal from "@/components/AddressModal";
import { useCart } from "@/components/CartProvider";

import Hero from "@/sections/Hero";
import TrustStrip from "@/sections/TrustStrip";
import FeaturedProducts from "@/sections/FeaturedProducts";
import ShopByCategory from "@/sections/ShopByCategory";
import NewArrivals from "@/sections/NewArrivals";
import WarriorStrip from "@/sections/WarriorStrip";
import Manifesto from "@/sections/Manifesto";
import OurStory from "@/sections/OurStory";
import InstagramGallery from "@/sections/InstagramGallery";

import { parsePrice } from "@/utils/parsePrice";

export default function HomePage() {
  const pathname = usePathname();

  const { cartOpen, setCartOpen, cartItems, setCartItems } = useCart();

  const [pageLoading, setPageLoading] = useState(false);
  const [barHidden, setBarHidden] = useState(false);

  const [addressOpen, setAddressOpen] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    setPageLoading(false);
  }, [pathname]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (t, item) =>
          t + parsePrice(item.price) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  return (
    <>
      <AnnouncementBar hidden={barHidden} />

      <Navbar
        pageLoading={pageLoading}
        setPageLoading={setPageLoading}
      />

      <Hero />

      <TrustStrip />

     

      <ShopByCategory
        setPageLoading={setPageLoading}
      />
 <FeaturedProducts
        setCartOpen={setCartOpen}
        setCartItems={setCartItems}
        setPageLoading={setPageLoading}
      />

            <WarriorStrip />


      <NewArrivals
        setCartOpen={setCartOpen}
        setCartItems={setCartItems}
        setPageLoading={setPageLoading}
      />


 
      <OurStory />

      <InstagramGallery />

      <CartDrawer
        open={cartOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
        setCartOpen={setCartOpen}
        cartTotal={cartTotal}
        setAddressOpen={setAddressOpen}
      />

      <AddressModal
        open={addressOpen}
        buyNowProduct={buyNowProduct}
        cartItems={cartItems}
        cartTotal={cartTotal}
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
        landmark={landmark}
        setLandmark={setLandmark}
        city={city}
        setCity={setCity}
        pincode={pincode}
        setPincode={setPincode}
        setAddressOpen={setAddressOpen}
      />
    </>
  );
}