import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import type { PrismaClient } from "../src/generated/prisma/client";
import { isOwnerRole } from "../src/lib/owner/access";

export async function provisionOwner(db: PrismaClient, input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !input.name.trim() || input.name.trim().length > 100 ||
      input.password.length < 12 || input.password.length > 128) {
    throw new Error("A valid email, name (1–100 characters), and password (12–128 characters) are required.");
  }
  // Maintained Better Auth scrypt implementation; matches the auth defaults.
  const password = await hashPassword(input.password);
  return db.$transaction(async (tx) => {
    // Serialize bootstrap scripts so two different emails cannot create owners.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(747736401)`;
    const users = await tx.user.findMany({ select: { id: true, email: true, role: true, accounts: { select: { providerId: true, password: true } } } });
    const existing = users.find((user) => user.email.toLowerCase() === email);
    if (existing) {
      if (!isOwnerRole(existing.role) || !existing.accounts.some((account) => account.providerId === "credential" && account.password)) {
        throw new Error("Existing account is not a provisioned owner. No credentials or roles were changed.");
      }
      return { created: false, id: existing.id };
    }
    if (users.some((user) => isOwnerRole(user.role))) throw new Error("An owner already exists. No account was created.");
    const id = randomUUID();
    await tx.user.create({ data: {
      id, email, name: input.name.trim(), role: "admin",
      accounts: { create: { id: randomUUID(), accountId: id, providerId: "credential", password } },
    } });
    return { created: true, id };
  });
}
