import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "server-only";

import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/constants";
import { HSWLPStickyBanner } from "@/components/startup-studio-sticky-banner";
import GDPRNotice from "@/components/gdpr-notice";
import ShowNewcomerToast from "@/components/show-newcomer-toast";

import GlobalMusicPlayer from "@/components/global-music-player";
import { getSessionFromCookie } from "@/utils/auth";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "AI platform",
    "generative AI",
    "music player",
    "image prompt",
    "cloud storage",
    "R2 storage",
    "D1 database",
    "Cloudflare Workers",
    "Next.js",
    "TypeScript",
    "Yumekai",
    "audio upload",
    "visual AI",
    "React dashboard",
    "prompt generation",
    "creative tools",
  ],

  authors: [{ name: "Csaba Polyak" }],
  creator: "L",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@LubomirGeorg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionFromCookie();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} pb-[120px]`}>
        <NextTopLoader
          initialPosition={0.15}
          shadow="0 0 10px #000, 0 0 5px #000"
          height={4}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider delayDuration={100} skipDelayDuration={50}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        <Toaster
          richColors
          closeButton
          position="top-right"
          expand
          duration={7000}
        />
        <ShowNewcomerToast />
        {session?.user && <GlobalMusicPlayer />}
        <HSWLPStickyBanner />
        <GDPRNotice />
        <Script id="cf-beacon" strategy="afterInteractive">
          {`(function () {
  const s = document.createElement("script");
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.defer = true;
  s.setAttribute("data-cf-beacon", '{"token": "TOKENED"}');
  s.onerror = () => console.warn("Cloudflare beacon not loaded – offline mode");
  document.head.appendChild(s);
})();`}
        </Script>
      </body>
    </html>
  );
}
