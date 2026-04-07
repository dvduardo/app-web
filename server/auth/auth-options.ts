import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/server/db/prisma";

function getOptionalEnv(name: string): string | null {
  return process.env[name]?.trim() || null;
}

function getNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "Usuario";
  const sanitized = localPart.replace(/[._-]+/g, " ").trim();

  if (!sanitized) {
    return "Usuario";
  }

  return sanitized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildProvider(
  clientIdName: string,
  clientSecretName: string,
  providerFactory: (options: { clientId: string; clientSecret: string }) => OAuthConfig<unknown>,
): OAuthConfig<unknown> | null {
  const clientId = getOptionalEnv(clientIdName);
  const clientSecret = getOptionalEnv(clientSecretName);

  if (!clientId || !clientSecret) {
    return null;
  }

  return providerFactory({ clientId, clientSecret });
}

const providers = [
  buildProvider("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", GoogleProvider),
  buildProvider("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", GitHubProvider),
  buildProvider("DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", DiscordProvider),
].filter((provider): provider is OAuthConfig<unknown> => provider !== null);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.type !== "oauth") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return "/auth/login?error=OAuthEmailMissing";
      }

      await prisma.$transaction(async (tx) => {
        const existingAccount = await tx.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        if (existingAccount) {
          await tx.oAuthAccount.update({
            where: { id: existingAccount.id },
            data: {
              accessToken: account.access_token ?? null,
              refreshToken: account.refresh_token ?? null,
              expiresAt: account.expires_at ?? null,
              tokenType: account.token_type ?? null,
              scope: account.scope ?? null,
            },
          });
          return;
        }

        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        const appUser =
          existingUser ??
          (await tx.user.create({
            data: {
              email,
              name: user.name?.trim() || getNameFromEmail(email),
              password: null,
            },
          }));

        await tx.oAuthAccount.create({
          data: {
            userId: appUser.id,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            accessToken: account.access_token ?? null,
            refreshToken: account.refresh_token ?? null,
            expiresAt: account.expires_at ?? null,
            tokenType: account.token_type ?? null,
            scope: account.scope ?? null,
          },
        });
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account?.type === "oauth") {
        const linkedAccount = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

        if (linkedAccount) {
          token.sub = linkedAccount.user.id;
          token.email = linkedAccount.user.email;
          token.name = linkedAccount.user.name;
        }
      }

      if (token.sub && (!token.email || !token.name)) {
        const existingUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            email: true,
            name: true,
          },
        });

        if (existingUser) {
          token.email = existingUser.email;
          token.name = existingUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email ?? session.user.email ?? "";
        session.user.name = token.name ?? session.user.name ?? "";
      }

      return session;
    },
  },
};
