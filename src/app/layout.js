import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCategories } from "@/lib/data";

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
import { Toaster } from "@/components/ui/sonner";

export default async function RootLayout({ children }) {
  const categories = await getCategories();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          <AuthProvider>
            <LayoutWrapper categories={categories}>
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </LayoutWrapper>
          </AuthProvider>
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}