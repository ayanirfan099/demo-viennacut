import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { verifyPassword } from "better-auth/crypto";
import { auth } from "../../src/lib/auth";
import { prisma } from "../../src/lib/prisma";
import { POST as login } from "../../src/app/api/owner/auth/login/route";
import { POST as logout } from "../../src/app/api/owner/auth/logout/route";
import { GET as me } from "../../src/app/api/owner/auth/me/route";
import { GET as rawGet, POST as rawPost } from "../../src/app/api/auth/[...all]/route";
import { provisionOwner } from "../../scripts/provision-owner-core";

const origin = "http://localhost:3000";
const email = `owner-${randomUUID()}@example.com`;
const password = randomUUID() + "-Aa9!";
const memberEmail = `member-${randomUUID()}@example.com`;
const ids: string[] = [];
const rateKeys = ["127.0.0.1|/sign-in/email", "no-trusted-ip|/sign-in/email", "127.0.0.1|/sign-out", "no-trusted-ip|/sign-out"];
function request(path: string, body?: unknown, cookie?: string, extra: Record<string, string> = {}) {
  return new Request(origin + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}), ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
function cookies(response: Response) { return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; "); }
async function ownerLogin() {
  const response = await login(request("/api/owner/auth/login", { email, password }));
  expect(response.status).toBe(200);
  return response;
}

beforeAll(async () => {
  const owner = await provisionOwner(prisma, { email, name: "Owner integration fixture", password });
  ids.push(owner.id);
  const member = await auth.api.createUser({ body: { email: memberEmail, password, name: "Member fixture", role: "user" } });
  ids.push(member.user.id);
});
beforeEach(async () => { await prisma.rateLimit.deleteMany({ where: { key: { in: rateKeys } } }); });
afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  await prisma.rateLimit.deleteMany({ where: { key: { in: rateKeys } } });
});

describe("owner authentication against PostgreSQL and Better Auth", () => {
  it("provisions a hashed owner once without replacing credentials", async () => {
    const account = await prisma.account.findFirstOrThrow({ where: { userId: ids[0], providerId: "credential" } });
    expect(account.password).not.toBe(password);
    expect(await verifyPassword({ hash: account.password!, password })).toBe(true);
    const repeat = await provisionOwner(prisma, { email: email.toUpperCase(), name: "Changed", password: randomUUID() });
    expect(repeat).toEqual({ created: false, id: ids[0] });
    expect((await prisma.account.findUniqueOrThrow({ where: { id: account.id } })).password).toBe(account.password);
    await expect(provisionOwner(prisma, { email: `second-${randomUUID()}@example.com`, name: "Second", password })).rejects.toThrow("already exists");
    await expect(provisionOwner(prisma, { email: memberEmail, name: "Member", password })).rejects.toThrow("not a provisioned owner");
  });

  it("logs in, sets HttpOnly SameSite cookies and returns only owner fields", async () => {
    const response = await ownerLogin();
    expect(await response.json()).toEqual({ owner: { id: ids[0], email } });
    expect(response.headers.get("cache-control")).toBe("no-store");
    const setCookie = response.headers.getSetCookie().find((value) => value.startsWith("better-auth.session_token="))!;
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Max-Age=43200");
    expect(setCookie).not.toContain("Secure");
    const session = await prisma.session.findFirstOrThrow({ where: { userId: ids[0] }, orderBy: { createdAt: "desc" } });
    expect(session.expiresAt.getTime() - session.createdAt.getTime()).toBeCloseTo(43_200_000, -3);
    const current = await me(request("/api/owner/auth/me", undefined, cookies(response)));
    expect(current.status).toBe(200);
    expect(await current.json()).toEqual({ owner: { id: ids[0], email } });
  });

  it("returns indistinguishable errors for wrong password and unknown email", async () => {
    const wrong = await login(request("/api/owner/auth/login", { email, password: "incorrect" }));
    const unknown = await login(request("/api/owner/auth/login", { email: `missing-${randomUUID()}@example.com`, password }));
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(wrong.headers.getSetCookie()).toEqual([]);
  });

  it.each([{}, [], null, { email: "invalid", password }, { email, password: "" }, { email, password: "x".repeat(129) }, { email, password, role: "admin" }])("rejects malformed login: %j", async (body) => {
    const response = await login(request("/api/owner/auth/login", body));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_REQUEST");
  });

  it("rejects invalid JSON, oversized bodies and form submissions", async () => {
    for (const [body, type] of [["{", "application/json"], ["x".repeat(5000), "application/json"], ["email=x&password=y", "application/x-www-form-urlencoded"]]) {
      expect((await login(new Request(origin + "/api/owner/auth/login", { method: "POST", headers: { origin, "content-type": type }, body }))).status).toBe(400);
    }
  });

  it.each(["https://attacker.example", "null", "", "http://localhost:3000.attacker.example"])("rejects untrusted or missing origin %s", async (badOrigin) => {
    for (const handler of [login, logout]) {
      const response = await handler(request("/api/owner/auth/login", { email, password }, undefined, { origin: badOrigin }));
      expect(response.status).toBe(403);
      expect((await response.json()).code).toBe("INVALID_ORIGIN");
    }
  });

  it("rejects cross-site fetch metadata even with a matching Origin", async () => {
    expect((await login(request("/api/owner/auth/login", { email, password }, undefined, { "sec-fetch-site": "cross-site" }))).status).toBe(403);
  });

  it("requires a real, unexpired signed session", async () => {
    expect((await me(request("/api/owner/auth/me"))).status).toBe(401);
    expect((await me(request("/api/owner/auth/me", undefined, "better-auth.session_token=forged"))).status).toBe(401);
    const cookie = cookies(await ownerLogin());
    await prisma.session.updateMany({ where: { userId: ids[0] }, data: { expiresAt: new Date(0) } });
    expect((await me(request("/api/owner/auth/me", undefined, cookie))).status).toBe(401);
  });

  it("invalidates the database session, clears cookies and rejects replay", async () => {
    const cookie = cookies(await ownerLogin());
    const response = await logout(request("/api/owner/auth/logout", {}, cookie));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(response.headers.getSetCookie().some((value) => value.includes("session_token=") && value.includes("Max-Age=0"))).toBe(true);
    expect(await auth.api.getSession({ headers: new Headers({ cookie }) })).toBeNull();
    expect((await me(request("/api/owner/auth/me", undefined, cookie))).status).toBe(401);
    expect((await logout(request("/api/owner/auth/logout", {}, cookie))).status).toBe(200);
    expect((await logout(request("/api/owner/auth/logout", {}))).status).toBe(200);
  });

  it("does not issue a session to a non-admin, even via the internal API", async () => {
    expect((await login(request("/api/owner/auth/login", { email: memberEmail, password }))).status).toBe(403);
    await expect(auth.api.signInEmail({ body: { email: memberEmail, password } })).rejects.toThrow();
    expect(await prisma.session.count({ where: { userId: ids[1] } })).toBe(0);
  });

  it("does not claim successful logout when session deletion fails", async () => {
    const cookie = cookies(await ownerLogin());
    const deletion = vi.spyOn(prisma.session, "deleteMany").mockRejectedValueOnce(new Error("Simulated database failure"));
    try {
      const response = await logout(request("/api/owner/auth/logout", {}, cookie));
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "Unable to sign out. Please retry.", code: "INTERNAL_ERROR" });
      expect((await me(request("/api/owner/auth/me", undefined, cookie))).status).toBe(200);
    } finally { deletion.mockRestore(); }
    expect((await logout(request("/api/owner/auth/logout", {}, cookie))).status).toBe(200);
  });

  it("rechecks current roles and bans for existing sessions", async () => {
    const cookie = cookies(await ownerLogin());
    try {
      await prisma.user.update({ where: { id: ids[0] }, data: { role: "user" } });
      expect((await me(request("/api/owner/auth/me", undefined, cookie))).status).toBe(403);
      await prisma.user.update({ where: { id: ids[0] }, data: { role: "admin", banned: true } });
      expect((await me(request("/api/owner/auth/me", undefined, cookie))).status).toBe(403);
      expect((await login(request("/api/owner/auth/login", { email, password }))).status).toBe(403);
    } finally { await prisma.user.update({ where: { id: ids[0] }, data: { role: "admin", banned: false } }); }
  });

  it("blocks signup internally and all raw auth endpoints publicly", async () => {
    const response = await auth.handler(request("/api/auth/sign-up/email", { email: `signup-${randomUUID()}@example.com`, password, name: "Denied" }));
    expect(response.status).toBe(400);
    expect((await rawGet()).status).toBe(404);
    expect((await rawPost()).status).toBe(404);
  });

  it("limits concurrent login attempts and ignores spoofed IP headers", async () => {
    const responses = await Promise.all(Array.from({ length: 8 }, (_, index) => login(request("/api/owner/auth/login", { email, password: "incorrect" }, undefined, { "x-forwarded-for": `192.0.2.${index + 1}`, "x-real-ip": `192.0.2.${index + 1}` }))));
    expect(responses.filter((response) => response.status === 401)).toHaveLength(5);
    const limited = responses.filter((response) => response.status === 429);
    expect(limited).toHaveLength(3);
    expect((await limited[0].json()).code).toBe("RATE_LIMITED");
    expect(Number(limited[0].headers.get("retry-after"))).toBeGreaterThan(0);
  });
});
