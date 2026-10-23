import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { isBanned, isOwnerRole } from "@/lib/owner/access";
import { authOrigin } from "@/lib/owner/config";

const origin = authOrigin();
if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
}

export const auth = betterAuth({
  appName: "Vienna Cuts",
  baseURL: origin,
  trustedOrigins: [origin],
  // Never trust a client-supplied forwarding header. A shared login bucket is
  // appropriate for this single-owner demo, including behind an unknown proxy.
  advanced: {
    ipAddress: { ipAddressHeaders: [] },
    useSecureCookies: origin.startsWith("https:"),
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax", path: "/" },
  },
  logger: { disabled: true },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },

  plugins: [admin()],

  session: {
    expiresIn: 60 * 60 * 12,
    updateAge: 60 * 60,
    disableSessionRefresh: true,
    cookieCache: { enabled: false },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({ where: { id: session.userId } });
          if (!user || !isOwnerRole(user.role) || isBanned(user)) {
            throw new APIError("FORBIDDEN", { message: "Owner access required." });
          }
        },
      },
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
    },
  },
});
