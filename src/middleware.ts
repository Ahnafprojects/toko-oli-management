// src/middleware.ts
import { withAuth } from "next-auth/middleware"

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
    "/products/:path*",
    "/suppliers/:path*",
  ] 
}