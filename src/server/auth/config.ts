import { PrismaAdapter } from "@auth/prisma-adapter";
import argon2 from "argon2"; // Import argon2
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
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

        if (user && user.password) {
          const isPasswordValid = await argon2.verify(
            user.password,
            credentials.password,
          );

          if (isPasswordValid) {
            console.log("User logged in:", user);
            return user;
          }
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    /**
     * Redirects to the baseUrl if the url is relative or if it starts with the baseUrl.
     * Otherwise, it returns the original url.
     * @param {{ url: string, baseUrl: string }} param0
     * @returns {Promise<string>}
     */
    redirect: async ({ url, baseUrl }) => {
      if (url === baseUrl || url.startsWith(baseUrl)) {
        return baseUrl;
      }
      return url;
    },
  },
};
