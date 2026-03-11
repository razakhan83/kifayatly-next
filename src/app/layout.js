'use cache';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCategories } from "@/lib/data";
import { cacheLife, cacheTag } from 'next/cache';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "China Unique Store",
  description: "Premium kitchenware, home decor and lifestyle products",
};

import { CartProvider } from "@/context/CartContext";
import AuthProvider from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

export default async function RootLayout({ children }) {
  cacheLife('minutes');
  cacheTag('shell');
  const categories = await getCategories();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      {/* Humne niche body tag mein suppressHydrationWarning add kiya hai */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          <AuthProvider>
            <LayoutWrapper categories={categories}>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}