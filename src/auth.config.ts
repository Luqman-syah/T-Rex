import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  session: { strategy: "jwt" },
  debug: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/expenses");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnHome = nextUrl.pathname === "/";
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (isOnHome) return true; // handled by page component

      if (isOnProtected && !isLoggedIn) return false; // redirect to login
      if (isOnLogin && isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
      return true;
    },
  },
} satisfies NextAuthConfig;
