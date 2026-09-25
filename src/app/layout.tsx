import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AlkaPreloved — Curated Preloved Fashion",
    template: "%s — AlkaPreloved",
  },
  description:
    "Temukan fashion preloved berkualitas dengan harga terjangkau. Setiap item dipilih dengan teliti untuk memastikan kualitas terbaik.",
  keywords: ["preloved", "second hand", "fashion", "thrift", "AlkaPreloved"],
  authors: [{ name: "AlkaPreloved" }],
  creator: "AlkaPreloved",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "AlkaPreloved",
    title: "AlkaPreloved — Curated Preloved Fashion",
    description:
      "Temukan fashion preloved berkualitas dengan harga terjangkau.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlkaPreloved",
    description:
      "Temukan fashion preloved berkualitas dengan harga terjangkau.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
