import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import AppKitProvider from "@/components/web3-modal/context-provider";
import { headers } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BAM | Bimodal Action Market",
  description: "Marketplace for both on-chain and off-chain actions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppKitProvider cookies={cookies}>{children}</AppKitProvider>
      </body>
    </html>
  );
}
