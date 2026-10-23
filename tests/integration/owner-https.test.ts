import { afterAll, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/lib/prisma";
import { auth } from "../../src/lib/auth";
import { POST as login } from "../../src/app/api/owner/auth/login/route";
import { POST as logout } from "../../src/app/api/owner/auth/logout/route";

// Configure before static imports, outside the test timeout. Importing the
// Next/Better Auth graph across the WSL mount can exceed the assertion timeout.
vi.hoisted(() => { vi.stubEnv("BETTER_AUTH_URL", "https://vienna.example"); });

let ownerId = "";
afterAll(async () => {
  if (ownerId) await prisma.user.deleteMany({ where: { id: ownerId } });
  await prisma.rateLimit.deleteMany({ where: { key: { in: ["127.0.0.1|/sign-in/email", "127.0.0.1|/sign-out"] } } });
  vi.unstubAllEnvs();
});

it("uses Secure HttpOnly cookies with an HTTPS origin and clears the same cookie on logout", async () => {
  const origin = "https://vienna.example";
  const email = `https-${randomUUID()}@example.com`;
  const password = randomUUID();
  ownerId = (await auth.api.createUser({ body: { email, password, role: "admin", name: "HTTPS fixture" } })).user.id;
  const response = await login(new Request(`${origin}/api/owner/auth/login`, {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ email, password }),
  }));
  expect(response.status).toBe(200);
  const setCookie = response.headers.getSetCookie().find((value) => value.startsWith("__Secure-better-auth.session_token="))!;
  expect(setCookie).toContain("Secure");
  expect(setCookie).toContain("HttpOnly");
  expect(setCookie).toContain("SameSite=Lax");
  expect(setCookie).not.toContain("Domain=");
  const signedOut = await logout(new Request(`${origin}/api/owner/auth/logout`, {
    method: "POST", headers: { origin, cookie: setCookie.split(";")[0] },
  }));
  expect(signedOut.status).toBe(200);
  expect(signedOut.headers.getSetCookie().some((value) => value.startsWith("__Secure-better-auth.session_token=") && value.includes("Max-Age=0"))).toBe(true);
});
