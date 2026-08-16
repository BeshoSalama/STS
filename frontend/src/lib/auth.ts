import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "sts-local-dev-secret-change-me",

  trustHost: true,

  // Custom PKCE cookie to avoid conflicts with old/stale Auth.js cookies
  cookies: {
    pkceCodeVerifier: {
      name: "__Secure-sts-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID ??
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ??
        process.env.GOOGLE_CLIENT_SECRET,

      allowDangerousEmailAccountLinking: true,

      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: parsed.data.email,
          },
        });

        if (!user?.passwordHash || !user.emailVerified) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const suppliedRole = (user as { role?: string }).role;

        if (suppliedRole) {
          token.role = suppliedRole;
        } else if (user.email) {
          const existingUser = await db.user.findUnique({
            where: {
              email: user.email,
            },
            select: {
              role: true,
            },
          });

          token.role = existingUser?.role ?? "CLIENT";
        }
      } else if (!token.role && token.email) {
        const existingUser = await db.user.findUnique({
          where: {
            email: token.email,
          },
          select: {
            role: true,
          },
        });

        token.role = existingUser?.role ?? "CLIENT";
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";

        session.user.role =
          typeof token.role === "string"
            ? token.role
            : "CLIENT";
      }

      return session;
    },
  },
});