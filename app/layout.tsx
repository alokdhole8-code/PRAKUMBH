import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Barlow_Condensed } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { CartProvider } from "@/components/CartProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://prakumbhclothing.com"),

  title: {
    default: "Prakumbh | Premium Maharashtrian Streetwear",
    template: "%s | Prakumbh",
  },

  description:
    "Shop premium Maharashtrian streetwear inspired by history, culture and heritage. High-quality oversized and regular fit T-shirts from Prakumbh.",

  keywords: [
    "Prakumbh",
    "Prakumbh Clothing",
    "Maratha T Shirt",
    "Shivaji Maharaj T Shirt",
    "Streetwear India",
    "Oversized T Shirt",
    "Maharashtra Clothing",
  ],

  alternates: {
    canonical: "https://prakumbhclothing.com",
  },

  openGraph: {
    title: "Prakumbh",
    description:
      "Premium Maharashtrian Streetwear Brand",
    url: "https://prakumbhclothing.com",
    siteName: "Prakumbh",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },

icons: {
  icon: [
    { url: "/favicon.ico" },
    { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
  ],
  shortcut: "/favicon.ico",
  apple: "/apple-touch-icon.png",
},
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
        </CartProvider>

        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-Q9JE91S8YN"
  strategy="afterInteractive"
/>

<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Q9JE91S8YN');
  `}
</Script>
      </body>
    </html>
  );
}