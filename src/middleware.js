import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
});

export const config = { 
  // Iska matlab: /admin ke andar sab ko protect karo, lekin /admin/login ko chorr do
  matcher: ["/admin/:path*", "/admin/((?!login).*)"] 
};