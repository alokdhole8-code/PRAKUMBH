'use client';
 import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { products, GOLD, NAVY, LIGHT, BORDER } from "./data/products";
import { motion, AnimatePresence } from "framer-motion";
import Navbar, { AnnouncementBar } from "@/components/Navbar";
 import { useCart } from "@/components/CartProvider";
import Image from "next/image";
import { handleBuyNow } from "@/lib/buyNow";
// ─── DATA ────────────────────────────────────────────────────────────────────
 
const SHOP_CATEGORIES = [
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
const categories = [
  "T-Shirt","Polo T-Shirts","Oversized T-Shirt","Prime Polo",
  "Cargo Pants","Seen On Shark Tank","Linen Shirt","Socks",
  "Full Sleeve T-Shirt","New Arrival","Combos","Bundles",
];
 

// ─── EASE ────────────────────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1];
 
 
 

// ─── HOOK ─────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
 
const slides = useRef([
  "/assets/new01.webp",
  "/assets/new02.webp",
  "/assets/new03.webp",
]).current;
  const [activeSlide, setActiveSlide] = useState(0);
const touchStartX = useRef(0);
useEffect(() => {
  const interval = setInterval(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, 5000);

  return () => clearInterval(interval);
}, []);

return (
  <section
    onTouchStart={(e) => {
      touchStartX.current = e.touches[0].clientX;
    }}
    onTouchEnd={(e) => {
      const diff =
        touchStartX.current -
        e.changedTouches[0].clientX;

      if (diff > 50) {
        setActiveSlide(
          (prev) => (prev + 1) % slides.length
        );
      }

      if (diff < -50) {
        setActiveSlide(
          (prev) =>
            (prev - 1 + slides.length) %
            slides.length
        );
      }
    }}
    style={{
      position: "relative",
      width: "100%",
      height: "clamp(20px,50vw,970px)",
      overflow: "hidden",
    }}
  >
    {/* IMAGE */}
    {slides.map((slide, index) => (
      <Image
        key={slide}
        src={slide}
        alt={`Hero ${index + 1}`}
        fill
        priority
        quality={60}
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: "center",
          opacity: activeSlide === index ? 1 : 0,
          transition: "opacity 1s ease-in-out",
          position: "absolute",
        }}
      />
    ))}

    {/* DOTS */}
    <div
      style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        zIndex: 50,
      }}
    >
      {slides.map((_, i) => (
        <div
          key={i}
          onClick={() => setActiveSlide(i)}
          style={{
            width: 8,
            height: 8,
            minWidth: 8,
            minHeight: 8,
            maxWidth: 8,
            maxHeight: 8,
            borderRadius: "50%",
            flexShrink: 0,
            cursor: "pointer",
            transition: "all 0.25s ease",
            background:
              activeSlide === i
                ? "#ffffff"
                : "rgba(255,255,255,0.55)",
          }}
        />
      ))}
    </div>
  </section>
);
}
// ─── HERO ────────────────────────────────────────────────────────────────────
 

// ─── CATEGORY NAV ────────────────────────────────────────────────────────────
 

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  setCartOpen,
  setCartItems,
  setPageLoading,
}) {
const router = useRouter();
 const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] =
  useState(product.defaultColor || "black");

  return (
    <motion.div
onClick={() => {
  setPageLoading(true);
  router.push(`/product/${product.id}`);
}}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}
<div
  style={{
    position: "relative",
    overflow: "hidden",
    background: "#f4f4f4",
    marginBottom: 8,
  }}
>
        {/* TAG */}
         

        {/* IMAGE */}
<Image
  src={product.images?.[selectedColor]?.back}
  alt={product.name}
  width={600}
  height={700}
  loading="lazy"
  sizes="(max-width:768px) 50vw, 25vw"
  quality={60}
style={{
  width: "100%",
  height: "auto",
  display: "block",
  transform: "translateZ(0)",
  willChange: "transform",
}}
/>
        {/* ADD TO CART */}
{!isMobile && (
  <motion.button
    initial={{ y: 100 }}
    animate={{
      y: hovered ? 0 : 100,
    }}
    transition={{
      duration: 0.35,
    }}
onClick={(e) => {
  e.stopPropagation();

  const cartProduct = {
    ...product,
    selectedColor,
    selectedSize: "M",
    quantity: 1,
    image:
      product.images?.[selectedColor]?.back ||
      product.images?.[product.defaultColor || "black"]?.back,
  };

  setCartItems((prev) => {
    const existingIndex = prev.findIndex(
      (item) =>
        item.id === product.id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === "M"
    );

    if (existingIndex !== -1) {
      const updated = [...prev];
      updated[existingIndex].quantity =
        (updated[existingIndex].quantity || 1) + 1;
      return updated;
    }

    return [...prev, cartProduct];
  });

  setCartOpen(true);
}}
    style={{
      position: "absolute",
      left: 18,
      right: 18,
      bottom: 18,
      height: 56,
      border: "none",
      background: "#0D1B2A",
      color: "#fff",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.14em",
      cursor: "pointer",
    }}
  >
    ADD TO CART
  </motion.button>
)}
      </div>

      {/* INFO */}
      <div>
        <h3
          style={{
            fontSize: 20,
            lineHeight: 1.4,
            marginBottom: 10,
            color: "#111",
          }}
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span
  style={{
    fontSize: 26,
    fontWeight: 700,
    color: "#111",
    lineHeight: 1,
  }}
>
            {product.price}
          </span>

          <span
            style={{
              fontSize: 16,
              color: "#999",
              textDecoration: "line-through",
            }}
          >
            {product.oldPrice}
          </span>
        </div>

        {/* COLORS */}

        {/* COLORS */}
<div
  className="shop-category-grid"
  style={{
    display: "flex",
    gap: 10,
  }}
>
  {Object.keys(product.images || {}).map(
    (colorKey, i) => (
      <div
        key={i}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedColor(colorKey);
        }}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background:
            colorKey === "black"
              ? "#111"
              : colorKey === "blue"
              ? "#2563EB"
              : colorKey === "grey"
              ? "#6B7280"
              : "#F5F5F5",

          border:
  selectedColor === colorKey
    ? "2px solid #0A2A66"
    : colorKey === "white"
    ? "1px solid #999"
    : "1px solid #dcdcdc",

          cursor: "pointer",
        }}
      />
    )
  )}
</div>
         
      </div>
    </motion.div>
  );
});
// ─── FEATURED SECTION ─────────────────────────────────────────────────────────
function FeaturedProducts({
  setCartOpen,
  setCartItems,
  setPageLoading,
}) {
  const isMobile = useIsMobile();

  const sliderRef = useRef(null);
   const scroll = (dir) => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: dir === "next" ? 420 : -420,
      behavior: "smooth",
    });
  };

  return (
    <section
      style={{
        background: "#fff",
        padding: "clamp(30px,0.5vw,0px) 0 clamp(40px,10vw,0px)",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: 1700,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
  style={{
    marginTop: 0,
    marginBottom: 20,
  }}
>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 2,
                background: GOLD,
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#888",
                fontWeight: 600,
              }}
            >
              Featured Collection
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(40px, 12vw, 90px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: NAVY }}>BESTSELLING </span>
            <span style={{ color: GOLD }}>NOW</span>
          </h2>
        </div>

        {/* SLIDER WRAPPER */}
        <div style={{ position: "relative" }}>
          
          {/* LEFT BUTTON */}
<button
  onClick={() => scroll("prev")}
  style={{
    position: "absolute",
    left: 10,
    top: "40%",
    transform: "translateY(-50%)",
    width: isMobile ? 42 : 54,
    height: isMobile ? 42 : 54,
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,10,10,0.92)",
    color: "#fff",
    zIndex: 99999,
    cursor: "pointer",
    fontSize: isMobile ? 15 : 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  ←
</button>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => scroll("next")}
            style={{
              position: "absolute",
              right: isMobile ? 4 : -10,
              top: "40%",
              transform: "translateY(-50%)",
              width: isMobile ? 42 : 54,
height: isMobile ? 42 : 54,
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(10,10,10,0.92)",
backdropFilter: "blur(10px)",
WebkitBackdropFilter: "blur(10px)",
color: "#fff",
zIndex: 40,
cursor: "pointer",
fontSize: isMobile ? 15 : 24,
display: "flex",
alignItems: "center",
justifyContent: "center",
boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
transition: "all 0.25s ease",
            }}
          >
            →
          </button>

          {/* HORIZONTAL CARDS */}
          <div
            ref={sliderRef}
            style={{
              display: "flex",
              gap: isMobile ? 14 : 28,
              overflowX: "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              contain: "layout paint",
              scrollbarWidth: "none",
              paddingBottom: 10,
            }}
            className="hide-scrollbar"
          >
{products.slice(0, 8).map((p, i) => (              <div
                key={p.id}
                style={{
                minWidth:
  isMobile
    ? "calc((100% - 12px) / 2)"
    : "calc((100% - 84px) / 4)",

maxWidth:
  isMobile
    ? "calc((100% - 12px) / 2)"
    : "calc((100% - 84px) / 4)",
                  flex: "0 0 auto",
                }}
              >
<div>
<ProductCard
  product={p}
  setCartOpen={setCartOpen}
  setCartItems={setCartItems}
  setPageLoading={setPageLoading}
/>
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function ShopByCategory({ setPageLoading }) {
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <section
      style={{
        padding: "40px 16px",
        background: "#fff",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(28px,5vw,42px)",
          fontWeight: 700,
          color: "#222",
          marginBottom: 24,
        }}
      >
        Shop By Category
      </h2>

      <div
  style={{
    display: "grid",
gridTemplateColumns: isMobile
  ? "repeat(2, 1fr)"
  : "repeat(3, 1fr)",

    gap: 20,
    maxWidth: 1400,
    margin: "0 auto",
  }}
>
        {SHOP_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
onClick={() => {
  setPageLoading(true);
  router.push(`/shop?category=${cat.id}`);
}}
            style={{
              position: "relative",
              aspectRatio: "0.75",
              overflow: "hidden",
              borderRadius: 14,
              cursor: "pointer",
            }}
          >
<Image
  src={cat.image}
  alt={cat.label}
  fill
  sizes="(max-width:768px) 50vw, 33vw"
  loading="lazy"
  style={{
    objectFit: "cover",
    transition: "transform .4s ease",
  }}
/>

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.05))",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 12,
                right: 12,
                textAlign: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: ".05em",
                textTransform: "uppercase",
              }}
            >
              {cat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewArrivals({
  setCartOpen,
  setCartItems,
  setPageLoading,
}) {
  const isMobile = useIsMobile();

  const sliderRef = useRef(null);
 
  const scroll = (dir) => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: dir === "next" ? 420 : -420,
      behavior: "smooth",
    });
  };

  return (
    <section
      style={{
        background: "#fff",
        padding: "0px 0 90px",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "95%",
          maxWidth: 1700,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
<div
  style={{
    marginTop: 0,
    marginBottom: 0
  }}
>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 2,
                background: GOLD,
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#888",
                fontWeight: 600,
              }}
            >
              New Arrivals
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(40px, 12vw, 90px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: NAVY }}>LATEST </span>
            <span style={{ color: GOLD }}>DROPS</span>
          </h2>
        </div>

        {/* SLIDER */}
        <div style={{ position: "relative" }}>
          
           {/* LEFT */}
{/* LEFT */}
<button
  onClick={() => scroll("prev")}
  style={{
    position: "absolute",
    left: isMobile ? 4 : -10,
    top: "40%",
    transform: "translateY(-50%)",
    width: isMobile ? 42 : 54,
height: isMobile ? 42 : 54,
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,10,10,0.92)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#fff",
    zIndex: 40,
    cursor: "pointer",
    fontSize: isMobile ? 15 : 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    transition: "all 0.25s ease",
  }}
>
  ←
</button>

           {/* RIGHT */}
<button
  onClick={() => scroll("next")}
  style={{
    position: "absolute",
    right: isMobile ? 4 : -10,
    top: "40%",
    transform: "translateY(-50%)",
    width: isMobile ? 42 : 54,
height: isMobile ? 42 : 54,
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,10,10,0.92)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#fff",
    zIndex: 40,
    cursor: "pointer",
    fontSize: isMobile ? 15 : 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    transition: "all 0.25s ease",
  }}
>
  →
  
</button>

          {/* CARDS */}
          <div
            ref={sliderRef}
            className="hide-scrollbar"
            style={{
  display: "flex",
  gap: isMobile ? 14 : 28,
  overflowX: "auto",
  overflowY: "hidden",
  scrollBehavior: "smooth",
  scrollbarWidth: "none",
  paddingBottom: 10,
  paddingRight: isMobile ? 6 : 28,
}}
          >
            {products
  .filter((p) =>
    [
       "fearless",
      "legacy-never-dies",
       "rise-to-victory",
       "the-vanguard",
       "ranaragini",
       "strength"
     ].includes(p.id)
  )
  .map((p, i) => (
              <div
                key={p.id}
                style={{
                  minWidth:
  isMobile
    ? "calc((100% - 14px) / 2)"
    : "calc((100% - 84px) / 4)",

maxWidth:
  isMobile
    ? "calc((100% - 14px) / 2)"
    : "calc((100% - 84px) / 4)",
                  flex: "0 0 auto",
                }}
              >
<div>
<ProductCard
  product={p}
  setCartOpen={setCartOpen}
  setCartItems={setCartItems}
  setPageLoading={setPageLoading}
/>
</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

 function WarriorStrip() {

  return (

  <section
  style={{
    background: "#0D1B2A",
    overflow: "hidden",
    height: 56,
    display: "flex",
    alignItems: "center",
    marginBottom: 60, // gap
  }}
>
      <style>{`

        @keyframes warriorMarquee {

          from { transform: translateX(0); }

          to { transform: translateX(-50%); }

        }



        .warrior-track{

          display:flex;

          width:max-content;

          white-space:nowrap;

          animation: warriorMarquee 20s linear infinite;

        }
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
      `}</style>



      <div className="warrior-track">

  <span
    style={{
      color:"#fff",
      fontSize:"18px",
      fontWeight:700,
      paddingRight:"70px",
      fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:"0.04em",
    }}
  >
     JAI BHAVANI • JAI SHIVAJI
  </span>

  <span
    style={{
      color:"#fff",
      fontSize:"18px",
      fontWeight:700,
      paddingRight:"70px",
      fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:"0.04em",
    }}
  >
     THE DREAM OF SWARAJYA LIVES FOREVER
  </span>

  <span
    style={{
      color:"#fff",
      fontSize:"18px",
      fontWeight:700,
      paddingRight:"70px",
      fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:"0.04em",
    }}
  >
     FROM RAIGAD TO EVERY HEART OF MAHARASHTRA
  </span>

  <span
    style={{
      color:"#fff",
      fontSize:"18px",
      fontWeight:700,
      paddingRight:"70px",
      fontFamily:"'Barlow Condensed', sans-serif",
      letterSpacing:"0.04em",
    }}
  >
     HINDAVI SWARAJYA • COURAGE • HONOUR • LEGACY
  </span>

</div>

    </section>

  );

}

 
function OurStory() {
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <section
  style={{
    background: "#fff",
    padding: "0px 10px 60px",
  }}
>
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
display: "grid",
gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
gap: isMobile ? 40 : 80,
textAlign: isMobile ? "center" : "left",
          alignItems: "center",
        }}
      >
        {/* IMAGE */}
        <div style={{ order: isMobile ? 1 : 1 }}>
<div
  style={{
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    background: "#F7F3EB",
    padding: isMobile ? "12px" : "12px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
    position: "relative",
height: isMobile ? "320px" : "520px",
  }}
>
<Image
  src="/assets/our-story.jpeg"
  alt="Our Story"
  fill
  loading="lazy"
  sizes="(max-width:768px) 100vw, 50vw"
  style={{
    objectFit: "cover",
    borderRadius: 18,
  }}
/>
  {/* Golden Glow */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(to top, rgba(13,27,42,0.25), transparent 40%)",
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
              alignItems: "center",
          gap: 20,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 2,
                background: GOLD,
              }}
            />
            <span
              style={{
                fontSize: 12,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#888",
                fontWeight: 600,
              }}
            >
              Our Legacy
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(50px,8vw,90px)",
              lineHeight: 0.95,
              marginBottom: 24,
            }}
          >
            <span style={{ color: NAVY }}>OUR </span>
            <span style={{ color: GOLD }}>STORY</span>
          </h2>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: "#555",
              marginBottom: 30,
            }}
          >
            Prakumbh was born from the spirit of Hindavi Swarajya
            and the timeless legacy of Chhatrapati Shivaji Maharaj.
            Every design carries the courage of the Mavalas, the
            pride of Maharashtra and the stories of warriors who
            shaped history.
          </p>

<button
  onClick={() => {
    window.location.href = "/shop";
  }}
  style={{
    height: 52,
    padding: "0 30px",
    border: "none",
    background: "#0D1B2A",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.12em",
  }}
>
  EXPLORE COLLECTION →
</button>
        </div>
      </div>
    </section>
  );
}
 
// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function WarriorWorldHomepage() {
  const isMobile = useIsMobile();
 const {
  cartOpen,
  setCartOpen,
  cartItems,
  setCartItems,
} = useCart();

 
  const [barHidden, setBarHidden] = useState(false);
const pathname = usePathname();

const [pageLoading, setPageLoading] = useState(false);

useEffect(() => {
  setPageLoading(false);
}, [pathname]);

 const [addressOpen, setAddressOpen] = useState(false);
const [buyNowProduct, setBuyNowProduct] = useState(null);

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
const [landmark, setLandmark] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");


const isFormValid =
  fullName.trim() &&
  phone.trim() &&
  address.trim() &&
  city.trim() &&
  pincode.trim();


useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const hidden = window.scrollY > 40;

        setBarHidden(prev =>
          prev === hidden ? prev : hidden
        );

        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener(
    "scroll",
    handleScroll,
    { passive: true }
  );

  return () =>
    window.removeEventListener(
      "scroll",
      handleScroll
    );
}, []);

useEffect(() => {
  // barHidden default already false; keep effect to avoid layout jump on hydration.
}, []);


  return (
    <>
      {/* GOOGLE FONTS + MATERIAL SYMBOLS */}
  
         <style>{`
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
 @media (min-width: 900px) {
  .shop-category-grid {
    grid-template-columns: repeat(3,1fr);
  }
}

   * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; } 
        body { font-family: 'Barlow Condensed', sans-serif; background: #fff; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #ccc; }
        button { outline: none; }
        .group:hover .group-hover\\:w-full { width: 100% !important; }
        body {
  overflow-x: hidden;
  text-rendering: optimizeSpeed;
  -webkit-font-smoothing: antialiased;
}

.gpu-layer {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
* {
  -webkit-tap-highlight-color: transparent;
}
      `}</style>

      <div>
        <AnnouncementBar hidden={barHidden} />
<Navbar
  barHidden={barHidden}
  setCartOpen={setCartOpen}
  cartItems={cartItems}
  setPageLoading={setPageLoading}
/>
        <div
  style={{
    paddingTop: 92,
    transition: "padding-top 0.35s cubic-bezier(0.16,1,0.3,1)",
  }}
>
<Hero />

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


</div>
{/* CART DRAWER */}
<AnimatePresence>
  {cartOpen && (
    <>
      {/* OVERLAY */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => setCartOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 2147483646,
        }}
      />

      {/* DRAWER */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
  position: "fixed",
  top: 0,
  right: 0,
  width: 380,
  maxWidth: "100%",
  height: "100dvh",
  background: "#fff",
  zIndex: 2147483647,
  padding: "18px 24px calc(18px + env(safe-area-inset-bottom))",
  display: "flex",
  flexDirection: "column",
}}
>
        {/* CLOSE */}
        <button
          onClick={() => setCartOpen(false)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 38,
            cursor: "pointer",
            alignSelf: "flex-end",
            lineHeight: 1,
            color: "#222",
          }}
        >
          ×
        </button>

       
{cartItems.length > 0 ? (
  <>
    <div
      style={{
        marginTop: 40,
        overflowY: "auto",
        flex: 1,
      }}
    >
      {cartItems.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
gap: 20,
alignItems: "flex-start",
            paddingBottom: 24,
            marginBottom: 24,
            borderBottom: "1px solid #ececec",
          }}
        >
<Image
  src={
    item.image ||
    item.images?.[
      item.selectedColor ||
      item.defaultColor ||
      "black"
    ]?.back
  }
  alt={item.name}
  width={110}
  height={140}
  style={{
    width: "110px",
    height: "140px",
    objectFit: "contain",
    background: "#f7f7f7",
    borderRadius: "8px",
    padding: "4px",
    flexShrink: 0,
  }}
/>

          <div style={{ flex: 1, minWidth: 0 }}>
  {/* TOP */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 14,
    }}
  >
    <div>
      <h4
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          color: "#111",
          fontWeight: 500,
          maxWidth: 160,
          marginBottom: 8,
        }}
      >
        {item.name}
      </h4>

      <p
  style={{
    fontSize: 15,
    color: "#444",
    marginBottom: 14,
  }}
>
  {(item.selectedColor || "Black")} · {(item.selectedSize || "M")}
</p>

      {/* PRICE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#000",
          }}
        >
          {item.price}
        </span>

        <span
          style={{
            fontSize: 15,
            color: "#aaa",
            textDecoration: "line-through",
          }}
        >
          ₹699.00
        </span>
      </div>

      {/* CONTROLS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* QUANTITY */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e5e5e5",
            borderRadius: 6,
            overflow: "hidden",
            height: 50,
          }}
        >
          {/* MINUS */}
          <button
            onClick={() => {
              setCartItems((prev) =>
                prev.map((cartItem) =>
                  cartItem.id === item.id
                    ? {
                        ...cartItem,
                        quantity: Math.max(
                          1,
                          (cartItem.quantity || 1) - 1
                        ),
                      }
                    : cartItem
                )
              );
            }}
            style={{
              width: 42,
              height: "100%",
              border: "none",
              background: "#fff",
              fontSize: 26,
              cursor: "pointer",
              color: "#222",
            }}
          >
            −
          </button>

          {/* COUNT */}
          <div
            style={{
              width: 48,
              textAlign: "center",
              fontSize: 20,
              color: "#111",
            }}
          >
            {item.quantity || 1}
          </div>

          {/* PLUS */}
          <button
            onClick={() => {
              setCartItems((prev) =>
                prev.map((cartItem) =>
                  cartItem.id === item.id
                    ? {
                        ...cartItem,
                        quantity: (cartItem.quantity || 1) + 1,
                      }
                    : cartItem
                )
              );
            }}
            style={{
              width: 48,
              height: "100%",
              border: "none",
              background: "#fff",
              fontSize: 26,
              cursor: "pointer",
              color: "#222",
            }}
          >
            +
          </button>
        </div>

        {/* DELETE */}
        <button
          onClick={() => {
            setCartItems((prev) =>
              prev.filter(
                (cartItem) => cartItem.id !== item.id
              )
            );
          }}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
               color: "#222",
            }}
          >
            delete
          </span>
        </button>
      </div>
    </div>

     
  </div>
</div>
        </div>
      ))}
    </div>

    {/* BUY NOW SECTION */}
<div
  style={{
    borderTop: "1px solid #ececec",
    paddingTop: 18,
    marginTop: 10,
    position: "sticky",
    bottom: 0,
    background: "#fff",
    zIndex: 20,
  }}
>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: "#444",
            fontWeight: 500,
          }}
        >
          Estimated total
        </span>

        <span
  style={{
    fontSize: 26,
    fontWeight: 700,
    color: "#111",
    lineHeight: 1,
  }}
>
        ₹{cartItems.reduce((total, item) => {
          return total + (
  Number(item.price.replace("₹", "").replace(".00", "")) *
  (item.quantity || 1)
);
        }, 0)}.00
      </span>
      </div>

      <p
        style={{
          fontSize: isMobile ? 11 : 14,
          color: "#666",
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        Duties and taxes included. Shipping is calculated at checkout.
      </p>

      <button
  onClick={() =>
handleBuyNow({
  cartItems,
  setAddressOpen,
  setBuyNowProduct,
})
  }
  style={{
    width: "100%",
    height: 64,
    borderRadius: 18,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: "pointer",
  }}
>
  BUY NOW →
</button>
    </div>
  </>
) : (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      marginTop: -20,
    }}
  >
    <h2
      style={{
        fontSize: 32,
        fontWeight: 700,
        color: "#1f2a44",
        marginBottom: 12,
      }}
    >
      Your cart is empty
    </h2>

    <p
      style={{
        fontSize: 16,
        color: "#222",
        marginBottom: 28,
      }}
    >
      Have an account?{" "}
      <span style={{ textDecoration: "underline" }}>
        Log in
      </span>{" "}
      to check out faster.
    </p>

    <button
      onClick={() => setCartOpen(false)}
      style={{
        background: "#000",
        color: "#fff",
        border: "none",
        padding: "14px 34px",
        borderRadius: 14,
        fontSize: 16,
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      Continue shopping
    </button>
  </div>
)}
      </motion.div>
    </>
  )}
</AnimatePresence>

{addressOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2147483648,
      padding: 16,
    }}
  >
    <div
      style={{
        width: 360,
        maxWidth: "92vw",
        background: "#fff",
        borderRadius: 34,
        padding: "28px 28px 32px",
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.35em",
              color: "#999",
              marginBottom: 10,
            }}
          >
            SECURE CHECKOUT
          </div>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#111",
            }}
          >
            Delivery Address
          </h2>
        </div>

        <button
          onClick={() => setAddressOpen(false)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: "#f3f3f3",
            cursor: "pointer",
            fontSize: 18,
            color: "#222",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* INPUTS */}
      <input
  placeholder="Full Name"
  value={fullName}
  onChange={(e) => setFullName(e.target.value)}
  style={{
    width: "100%",
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    marginBottom: 14,
    fontSize: 15,
    outline: "none",
    background: "#fff",
  }}
/>

<input
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  style={{
    width: "100%",
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    marginBottom: 14,
    fontSize: 15,
    outline: "none",
    background: "#fff",
  }}
/>

<input
  placeholder="Complete Address"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  style={{
    width: "100%",
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    marginBottom: 14,
    fontSize: 15,
    outline: "none",
    background: "#fff",
  }}
/>
<input
  placeholder="Landmark"
  value={landmark}
  onChange={(e) => setLandmark(e.target.value)}
  style={{
    width: "100%",
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    marginBottom: 14,
    fontSize: 15,
    outline: "none",
    background: "#fff",
  }}
/>

      {/* CITY + PINCODE */}
<div
  style={{
    display: "grid",
gridTemplateColumns:
  isMobile ? "1fr" : "1fr 1fr",
    gap: 12,
    width: "100%",
  }}
>
<input
  placeholder="City"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  style={{
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    fontSize: 15,
    outline: "none",
  }}
/>
<input
  placeholder="Pincode"
  value={pincode}
  onChange={(e) => setPincode(e.target.value)}
  style={{
    height: 52,
    border: "1px solid #e7e7e7",
    borderRadius: 16,
    padding: "0 16px",
    fontSize: 15,
    outline: "none",
  }}
/>
      </div>

      {/* TOTAL */}
      <div
        style={{
          marginTop: 22,
          background: "#f6f6f6",
          borderRadius: 18,
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 17,
            color: "#222",
          }}
        >
          Total Amount
        </span>

        <strong
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#111",
          }}
        >
          ₹{cartItems.reduce((total, item) => {
            return (
              total +
              Number(
                item.price.replace("₹", "").replace(".00", "")
              ) *
                (item.quantity || 1)
            );
          }, 0)}
        </strong>
      </div>

      {/* BUTTON */}
<button
  disabled={!isFormValid}
  onClick={() => {
    if (!isFormValid) return;

    const message = "Send this message to confirm your order.";


    const currentUser = JSON.parse(
  localStorage.getItem("prakumbh_current")
);

if (currentUser) {
  const users =
    JSON.parse(
      localStorage.getItem("prakumbh_users")
    ) || [];

  const userIndex = users.findIndex(
    (u) => u.id === currentUser.id
  );

  if (userIndex !== -1) {
    const orderData = {
      id: "ORD" + Date.now(),
      date: new Date().toISOString(),
      status: "Processing",

items: cartItems.map(item => ({
  ...item,
  image:
    item.images?.[
      item.selectedColor ||
      item.defaultColor ||
      "black"
    ]?.back || "",
})),
      total: cartItems.reduce(
        (total, item) =>
          total +
          Number(
            item.price
              .replace("₹", "")
              .replace(".00", "")
          ) *
            (item.quantity || 1),
        0
      ),

      shippingAddress: {
        name: fullName,
        phone,
        line1: address,
        line2: landmark,
        city,
        pincode,
      },
    };

    if (!users[userIndex].orders) {
      users[userIndex].orders = [];
    }

    users[userIndex].orders.unshift(orderData);

    localStorage.setItem(
      "prakumbh_users",
      JSON.stringify(users)
    );
  }
}
const orderPayload = {
  orderId: "PK" + Date.now(),
  date: new Date().toLocaleString(),

  name: fullName,
  phone,
  address,
  city,
  state: "Maharashtra",
  pincode,

  product: cartItems
    .map(
      (item) =>
        `${item.name} | Color: ${item.selectedColor} | Size: ${item.selectedSize}`
    )
    .join(" || "),

  quantity: cartItems.reduce(
    (t, i) => t + (i.quantity || 1),
    0
  ),

  amount: cartItems.reduce(
    (t, i) =>
      t +
      Number(
        i.price
          .replace("₹", "")
          .replace(".00", "")
      ) *
        (i.quantity || 1),
    0
  ),
};


    const whatsappUrl =
      `https://wa.me/918766599895?text=${encodeURIComponent(message)}`;

      const win = window.open(
  whatsappUrl,
  "_blank"
);

    setAddressOpen(false);
    setCartOpen(false);
    setCartItems([]);

    setFullName("");
    setPhone("");
    setAddress("");
    setLandmark("");
    setCity("");
    setPincode("");


setTimeout(() => {
  fetch(
    "https://script.google.com/macros/s/AKfycbxYG8KeTKrt2sLhhrCyJ52m0E5XWUTzZYsYcmObNoDJm5q_ol_jXv_1XIM-lnTo-YsrLg/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(orderPayload),
    }
  ).catch(console.error);
}, 0);

 
  }}

  
  style={{
    width: "100%",
    height: 56,
    marginTop: 22,
    border: "none",
    borderRadius: 18,
    background: isFormValid ? "#111" : "#CFCFCF",
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: ".02em",
    cursor: isFormValid ? "pointer" : "not-allowed",
    opacity: isFormValid ? 1 : 0.7,
  }}
>
  PLACE ORDER →
</button>
    </div>
  </div>
)}
 {/* FOOTER STRIP */}
<div
  style={{
    background: NAVY,
    padding: "28px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  }}
>
  <div
    style={{
      fontFamily: "'Oswald', sans-serif",
      fontSize: 22,
      letterSpacing: "0.3em",
      color: "#fff",
    }}
  >
    PRAKUMBH
  </div>

  <div
    style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 12,
      letterSpacing: "0.15em",
      color: "rgba(255,255,255,0.4)",
      textTransform: "uppercase",
    }}
  >
    © 2025 Prakumbh. India's Premium Streetwear.
  </div>

<div style={{ display: "flex", gap: 24 }}>
  <a
    href="https://www.instagram.com/prakumbhclothing?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
    target="_blank"
    rel="noopener noreferrer"
    style={{
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 12,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.55)",
      textDecoration: "none",
      transition: "color .25s ease",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.color = "#D4AF37")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
    }
  >
    Instagram
  </a>
</div>
</div>
        {pageLoading && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(255,255,255,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999999,
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        border: "4px solid #ddd",
        borderTop: "4px solid #0D1B2A",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  </div>
)}
      </div>
    </>
  );
}