import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Front Desk Stack Cost Calculator",
  description:
    "Estimate your current front-desk stack costs, compare them with Breezy, and unlock a benchmark-based report."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
