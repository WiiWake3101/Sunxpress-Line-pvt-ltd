import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sun Xpress Line - Global Logistics & Shipping Solutions",
  description: "Professional ocean freight, bulk cargo, and port logistics services with expertise in Tuticorin Port. Real-time tracking, customs clearance, and cargo insurance.",
  keywords: "logistics, shipping, ocean freight, bulk cargo, port logistics, Tuticorin, cargo insurance, customs clearance",
  author: "Sun Xpress Line",
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  openGraph: {
    title: "Sun Xpress Line - Global Logistics & Shipping",
    description: "Professional ocean freight, bulk cargo, and port logistics services",
    url: "https://sunxp.in",
    siteName: "Sun Xpress Line",
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sun Xpress Line - Logistics Solutions",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sun Xpress Line - Global Logistics",
    description: "Professional shipping and logistics services",
    image: "/logo/og-image.png",
  },
  canonical: "https://sunxp.in",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://sunxp.in" />
        <meta name="theme-color" content="#319795" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Sun Xpress Line",
              url: "https://sunxp.in",
              logo: "https://sunxp.in/logo/logo.png",
              description: "Global logistics and shipping company specializing in ocean freight and port logistics",
              sameAs: [
                "https://www.linkedin.com/company/sun-xpress-line",
                "https://www.facebook.com/sunxpressline",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Support",
                email: "admin@sunxp.in",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
