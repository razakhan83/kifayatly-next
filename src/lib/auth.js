import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail, normalizeEmail } from "@/lib/admin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

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
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await dbConnect();
          const normalizedEmail = normalizeEmail(user.email);
          
          await User.findOneAndUpdate(
            { email: normalizedEmail },
            { 
              name: user.name, 
              image: user.image,
              email: normalizedEmail
            },
            { upsert: true, new: true }
          );
          return true;
        } catch (error) {
          console.error("Error saving user profile:", error);
          return true; // Still allow sign in even if profile save fails
        }
      }
      return true;
    },
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
