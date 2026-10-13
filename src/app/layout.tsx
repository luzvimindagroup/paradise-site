import type { Metadata } from "next";
import { Big_Shoulders, Figtree, Sedgwick_Ave_Display } from "next/font/google";
import { ALLOW_INDEXING, SITE } from "@/config/site";
import "./globals.css";

const shoulders = Big_Shoulders({
  variable: "--font-shoulders",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const sedgwick = Sedgwick_Ave_Display({
  variable: "--font-sedgwick",
  subsets: ["latin"],
  weight: "400",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: { default: SITE.series, template: `%s | ${SITE.series}` },
  description:
    "Filipino-American talent of every genre and generation, live in San Diego's South Bay.",
  // Pages must not set their own `robots`: nested segments overwrite this.
  robots: ALLOW_INDEXING
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${shoulders.variable} ${figtree.variable} ${sedgwick.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
