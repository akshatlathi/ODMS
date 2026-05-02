import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: "CareQ by Zlice - Demand Survey",
  description: "Help us understand your household needs to bring better, verified services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakarta.className}>
        {children}
      </body>
    </html>
  );
}
