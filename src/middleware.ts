// src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = { 
  // Tentukan halaman mana saja yang ingin Anda amankan
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/pos/:path*",
    "/suppliers/:path*",
  ] 
}