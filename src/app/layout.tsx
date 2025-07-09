// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import NextAuthProvider from "@/components/providers/NextAuthProvider"; // Import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manajemen Toko Oli",
  description: "Aplikasi Manajemen Toko Oli dengan AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider> {/* Bungkus di sini */}
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="p-8">{children}</div>
            </main>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}