/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow your other device (replace IP if needed)
  allowedDevOrigins: ['192.168.0.216'],
  
  // Image optimization for better SEO and performance
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for immutable images
  },

  // Compression and optimization
  compress: true,
  
  // Experimental: Optimized package imports
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*"],
  },

  // Headers for performance and SEO
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Redirects for old URLs (add as needed)
  async redirects() {
    return [];
  },

  // Rewrite rules if needed
  async rewrites() {
    return [];
  },
};

export default nextConfig;
