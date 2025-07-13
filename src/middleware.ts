// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { Drum } from 'lucide-react';

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = { 
  // Melindungi semua halaman ini dan sub-halamannya
  matcher: [
    "/home/:path*",
    "/dashboard/:path*",
    "/transactions/:path*",
    "/stock-history/:path*",
    "/pos/:path*",
    "/Drum/:path*/",
    "/products/:path*",
    "/suppliers/:path*",
  ] 
}