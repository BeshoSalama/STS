import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  // Auth.js secret
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "sts-local-dev-secret-change-me",

  // مهم لأن الموقع Production خلف Nginx / Reverse Proxy
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    // =========================
    // Google Login
    // =========================
    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID ??
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ??
        process.env.GOOGLE_CLIENT_SECRET,

      // يسمح بربط Google بحساب موجود بنفس الإيميل
      allowDangerousEmailAccountLinking: true,

      // يجبر Google على إظهار اختيار الحساب كل مرة
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    // =========================
    // Email + Password Login
    // =========================
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
    // =========================
    // JWT
    // =========================
    async jwt({ token, user }) {
      if (user) {
        /*
         * Credentials login بيكون role موجود بالفعل.
         *
         * في Google Login ممكن الـ role ما يكونش موجود
         * مباشرة على user object، لذلك نرجع للداتابيز.
         */
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
        /*
         * في الـ requests التالية نضمن وجود role
         * حتى لو لم تكن موجودة داخل JWT.
         */
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

    // =========================
    // Session
    // =========================
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