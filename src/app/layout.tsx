import type { Metadata, Viewport } from "next";
import { Inter, Playfair, Playfair_Display, Newsreader } from "next/font/google";
import localFont from "next/font/local";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import Script from "next/script";
import ClientProviders from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const zingScript = localFont({
  src: "./Fonts/FontsFree-Net-ZingScriptRustSBDemo-Base.otf",
  variable: "--font-zingscript",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#E9622F",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Curated Travel Experiences, Community Trips & Retreats | Nomadic Townies",
  description:
    "Discover community trips, backpacking adventures, wellness retreats, workshops, and cultural immersions hosted by passionate communities. Nomadic Townies is a curated marketplace for transformative travel experiences.",
  keywords:
    "curated travel experiences, community trips, backpacking adventures, wellness retreats, cultural immersions, travel workshops, host-led experiences, meaningful travel, Nomadic Townies",
  authors: [{ name: "Nomadic Townies" }],
  robots: "index, follow",
  icons: {
    icon: "/nt.png",
  },
  alternates: {
    canonical: "https://nomadictownies.com/",
  },
  openGraph: {
    type: "website",
    url: "https://nomadictownies.com/",
    siteName: "Nomadic Townies",
    title: "Nomadic Townies | Curated Travel Experiences & Community Trips",
    description:
      "Explore meaningful travel experiences hosted by passionate communities — from backpacking adventures and retreats to workshops and cultural immersions.",
    images: [
      {
        url: "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomadic Townies | Curated Travel Experiences",
    description:
      "Discover host-led community trips, retreats, workshops, and cultural immersions through Nomadic Townies.",
    images: [
      "https://nomadic-townies-assets.sgp1.cdn.digitaloceanspaces.com/about-images/aboutbg1.jpg",
    ],
  },
  other: {
    "geo.region": "IN",
    "geo.country": "India",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${playfairDisplay.variable} ${newsreader.variable} ${zingScript.variable}`}
    >
      <head>
        {/* Tabler Icons Webfont */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.7.0/dist/tabler-icons.min.css"
        />
        {/* Structured Data: Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "Nomadic Townies",
                  "url": "https://nomadictownies.com/",
                  "logo": "https://nomadictownies.com/nt.png",
                  "description": "A curated marketplace for host-led travel experiences — community trips, retreats, workshops and cultural immersions.",
                  "sameAs": [
                    "https://www.instagram.com/nomadictownies",
                    "https://www.facebook.com/nomadictownies"
                  ]
                },
                {
                  "@type": "WebSite",
                  "name": "Nomadic Townies",
                  "url": "https://nomadictownies.com/",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://nomadictownies.com/experiences?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MS6QGCX6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
            var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s),
              dl = l != "dataLayer" ? "&l=" + l : "";
            j.async = true;
            j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
            f.parentNode.insertBefore(j, f);
          })(window, document, "script", "dataLayer", "GTM-MS6QGCX6");`}
        </Script>

        <AppRouterCacheProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
