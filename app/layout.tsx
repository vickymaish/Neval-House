import type { Metadata } from "next";
import "./globals.css";
import { property } from "@/data/property";
import { getHero } from "@/lib/photos";
import { heroImage } from "@/data/site";

export const metadata: Metadata = {
  title: property.seo.title,
  description: property.seo.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"), // TODO: set the live canonical site URL.
  openGraph: {
    title: property.seo.title,
    description: property.seo.description,
    type: "website",
    images: [{ url: getHero(heroImage).src, width: getHero(heroImage).width, height: getHero(heroImage).height, alt: getHero(heroImage).alt }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
