import type {
  Metadata,
  Viewport,
} from "next";
import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#008080",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ??
        "https://czypamietaszto.pl",
    ),

    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },

    description: settings.siteDescription,

    keywords: [
      "nostalgia",
      "dzieciństwo",
      "stare gry",
      "stare piosenki",
      "słodycze",
      "dawny internet",
      "wspomnienia",
      "lata 2000",
    ],

    authors: [
      {
        name: settings.siteName,
      },
    ],

    creator: settings.siteName,

    openGraph: {
      type: "website",
      locale: "pl_PL",
      url: "/",
      siteName: settings.siteName,
      title: settings.siteName,
      description: settings.siteDescription,
    },

    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.siteDescription,
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: "/",
    },
  };
}

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}