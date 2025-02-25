import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import generateUniqueUsername from "~/lib/utils/generateUniqueUsername";
import { verifyPassword } from "~/lib/utils/verifyPassword";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username: string;
  }
}

interface GoogleProfile {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      async profile(profile: GoogleProfile, tokens) {
        console.log("Google profile", profile);
        console.log("Google tokens", tokens);
        if (!profile.email) {
          throw new Error("Google profile is missing email");
        }

        const username = await generateUniqueUsername(profile.name ?? "");

        const user = await db.user.upsert({
          where: { email: profile.email },
          update: {},
          create: {
            name: profile.name ?? "",
            email: profile.email,
            image: profile.picture ?? "",
            username: username,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await db.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username },
            ],
          },
        });
        const password = credentials.password as string;

        if (user && password) {
          const isValid = await verifyPassword(password, user.password ?? "");

          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              username: user.username,
            };
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }

      if (trigger === "update") {
        const updatedUser = await db.user.findUnique({
          where: { id: token.id as string },
        });
        if (updatedUser) {
          token.username = updatedUser.username;
        }
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
        },
      };
    },
  },
  adapter: PrismaAdapter(db),
};
