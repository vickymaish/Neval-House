import type { Metadata } from "next";
import "./globals.css";
import { property } from "@/data/property";

export const metadata: Metadata = {
  title: property.seo.title,
  description: property.seo.description,
  openGraph: {
    title: property.seo.title,
    description: property.seo.description,
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
