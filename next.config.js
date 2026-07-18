const nextConfig = {
  devIndicators: false,

  images: {
    unoptimized: true,

    qualities: [35, 60, 75],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

async redirects() {
  return [
    {
      source: "/designs",
      destination: "/shop",
      permanent: true,
    },
    {
      source: "/designs/:path*",
      destination: "/shop",
      permanent: true,
    },
    {
      source: "/products",
      destination: "/shop",
      permanent: true,
    },
    {
      source: "/products/:path*",
      destination: "/shop",
      permanent: true,
    },
  ];
},
};

module.exports = nextConfig;