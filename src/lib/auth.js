import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail, normalizeEmail } from "@/lib/admin";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Console log laga raha hun taake terminal mein nazar aaye kya ho raha hai
        console.log("Login Attempt:", credentials.email);

        if (
          isAdminEmail(credentials.email) &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Raza Admin", email: normalizeEmail(credentials.email) };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email || token?.email;
      token.isAdmin = isAdminEmail(email);
      if (email) {
        token.email = normalizeEmail(email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.email = normalizeEmail(session.user.email || token?.email);
        session.user.isAdmin = Boolean(token?.isAdmin);
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
