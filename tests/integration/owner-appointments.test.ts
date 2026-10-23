import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { auth } from "../../src/lib/auth";
import { prisma } from "../../src/lib/prisma";
import { GET as list } from "../../src/app/api/owner/appointments/route";
import { PATCH as patch } from "../../src/app/api/owner/appointments/[id]/route";
import { GET as availability } from "../../src/app/api/availability/route";
import type { AppointmentStatus } from "../../src/generated/prisma/enums";

const origin = "http://localhost:3000";
const prefix = `owner-api-${randomUUID()}`;
const serviceId = `${prefix}-service`;
const barberId = `${prefix}-barber`;
const otherBarberId = `${prefix}-other`;
const customerId = `${prefix}-customer`;
const statuses: AppointmentStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
let ownerId = "";
let cookie = "";
function request(path: string, body?: unknown, useCookie = true, requestOrigin = origin) {
  return new Request(origin + path, {
    method: body === undefined ? "GET" : "PATCH",
    headers: { origin: requestOrigin, "content-type": "application/json", ...(useCookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const query = (suffix = "", useCookie = true) => list(request(`/api/owner/appointments?barberId=${barberId}${suffix}`, undefined, useCookie));
const update = (id: string, body: unknown, useCookie = true, requestOrigin = origin) => patch(request(`/api/owner/appointments/${id}`, body, useCookie, requestOrigin), { params: Promise.resolve({ id }) });
async function appointment(id: string, status: AppointmentStatus, startsAt = "2026-11-16T09:00:00.000Z", barber = barberId) {
  return prisma.appointment.create({ data: {
    id, customerId, serviceId, barberId: barber, status,
    startsAt: new Date(startsAt), endsAt: new Date(Date.parse(startsAt) + 30 * 60_000),
    priceCents: 2800, durationMinutes: 30, customerNotes: "Customer note", internalNotes: "Internal note",
  } });
}
beforeAll(async () => {
  const password = randomUUID();
  const owner = await auth.api.createUser({ body: { email: `${prefix}@example.com`, name: "Owner fixture", password, role: "admin" } });
  ownerId = owner.user.id;
  const response = await auth.api.signInEmail({ body: { email: owner.user.email, password }, asResponse: true });
  cookie = response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  await prisma.service.create({ data: { id: serviceId, name: "Fixture service", priceCents: 2800, durationMinutes: 30 } });
  await prisma.barber.createMany({ data: [{ id: barberId, name: "Fixture barber" }, { id: otherBarberId, name: "Other barber" }] });
  await prisma.customer.create({ data: { id: customerId, name: "Fixture customer", email: "fixture@example.com", phone: null } });
  await prisma.workingHour.create({ data: { barberId, dayOfWeek: 1, startMinute: 540, endMinute: 1020 } });
  for (const [index, status] of statuses.entries()) {
    await appointment(`${prefix}-${status}`, status, `2026-11-16T${String(9 + index).padStart(2, "0")}:00:00.000Z`);
  }
  await appointment(`${prefix}-other`, "CANCELLED", "2026-11-16T09:00:00.000Z", otherBarberId);
});
afterAll(async () => {
  await prisma.appointment.deleteMany({ where: { customerId } });
  await prisma.customer.deleteMany({ where: { id: customerId } });
  await prisma.barber.deleteMany({ where: { id: { in: [barberId, otherBarberId] } } });
  await prisma.service.deleteMany({ where: { id: serviceId } });
  if (ownerId) await prisma.user.deleteMany({ where: { id: ownerId } });
});

describe("owner appointment listing", () => {
  it("lists selected fields with UTC times, snapshot prices and stable ordering", async () => {
    const response = await query();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body.total).toBe(5);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(20);
    expect(body.data[0]).toEqual({
      id: `${prefix}-PENDING`, startsAt: "2026-11-16T09:00:00.000Z", endsAt: "2026-11-16T09:30:00.000Z", status: "PENDING",
      customer: { name: "Fixture customer", email: "fixture@example.com", phone: null },
      service: { id: serviceId, name: "Fixture service" }, barber: { id: barberId, name: "Fixture barber" },
      priceCents: 2800, customerNotes: "Customer note", internalNotes: "Internal note",
    });
    expect(body.data.map((row: { status: string }) => row.status)).toEqual(statuses);
  });

  it.each(statuses)("filters status %s with barber and date", async (status) => {
    const response = await query(`&status=${status}&date=2026-11-16`);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.data[0].status).toBe(status);
  });

  it("paginates without duplicates and accepts the maximum page size", async () => {
    const first = await (await query("&page=1&limit=2")).json();
    const second = await (await query("&page=2&limit=2")).json();
    const third = await (await query("&page=3&limit=2")).json();
    expect([first.total, second.total, third.total]).toEqual([5, 5, 5]);
    expect(new Set([...first.data, ...second.data, ...third.data].map((row) => row.id)).size).toBe(5);
    expect((await (await query("&page=4&limit=2")).json()).data).toEqual([]);
    expect((await query("&limit=100")).status).toBe(200);
  });

  it("returns empty results for unmatched dates and barbers", async () => {
    expect(await (await query("&date=2026-11-17")).json()).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    expect((await (await list(request("/api/owner/appointments?barberId=missing-barber"))).json()).total).toBe(0);
  });

  it.each(["page=0", "page=-1", "page=1.5", "page=1e2", "page=", "page=9007199254740992", "page=2147483648", "limit=0", "limit=101", "limit=-5", "limit=2.5", "status=invalid", "date=2026-02-30", "date=2026-1-1", "date=0000-01-01", "date=2026-10-25T00:00:00Z", "page=1&page=2", "unknown=value"])("rejects invalid query %s", async (value) => {
    const response = await query(`&${value}`);
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("INVALID_REQUEST");
  });

  it.each([
    ["2026-03-29", "2026-03-28T23:00:00.000Z", "2026-03-29T22:00:00.000Z", 23],
    ["2026-10-25", "2026-10-24T22:00:00.000Z", "2026-10-25T23:00:00.000Z", 25],
  ])("uses a half-open Vienna day across DST: %s", async (date, start, end, hours) => {
    expect((Date.parse(String(end)) - Date.parse(String(start))) / 3_600_000).toBe(hours);
    const times = [new Date(Date.parse(String(start)) - 1), new Date(String(start)), new Date(Date.parse(String(end)) - 1), new Date(String(end))];
    const rows = [];
    try {
      for (const [index, time] of times.entries()) rows.push(await appointment(`${prefix}-${date}-${index}`, "CANCELLED", time.toISOString()));
      const body = await (await query(`&date=${date}`)).json();
      expect(body.total).toBe(2);
      expect(body.data.map((row: { id: string }) => row.id)).toEqual([rows[1].id, rows[2].id]);
    } finally { await prisma.appointment.deleteMany({ where: { id: { in: rows.map((row) => row.id) } } }); }
  });

  it("uses ID to order appointments with equal start times", async () => {
    const ids = [`${prefix}-tie-a`, `${prefix}-tie-b`];
    try {
      await appointment(ids[1], "CANCELLED", "2026-11-18T09:00:00Z");
      await appointment(ids[0], "CANCELLED", "2026-11-18T09:00:00Z");
      const first = await (await query("&date=2026-11-18&limit=1&page=1")).json();
      const second = await (await query("&date=2026-11-18&limit=1&page=2")).json();
      expect([first.data[0].id, second.data[0].id]).toEqual(ids);
      expect(first.total).toBe(2);
    } finally { await prisma.appointment.deleteMany({ where: { id: { in: ids } } }); }
  });
});

describe("authorization and appointment status management", () => {
  it("rejects unauthenticated reads and writes before exposing appointment data", async () => {
    expect((await query("", false)).status).toBe(401);
    expect((await update(`${prefix}-PENDING`, { status: "CONFIRMED" }, false)).status).toBe(401);
  });
  it("rejects authenticated non-admin reads and writes", async () => {
    try {
      await prisma.user.update({ where: { id: ownerId }, data: { role: "user" } });
      expect((await query()).status).toBe(403);
      expect((await update(`${prefix}-PENDING`, { status: "CONFIRMED" })).status).toBe(403);
    } finally { await prisma.user.update({ where: { id: ownerId }, data: { role: "admin" } }); }
  });
  it("rejects cross-origin writes", async () => {
    const response = await update(`${prefix}-PENDING`, { status: "CANCELLED" }, true, "https://attacker.example");
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe("INVALID_ORIGIN");
  });
  it.each([["PENDING", "CONFIRMED"], ["PENDING", "CANCELLED"], ["CONFIRMED", "CANCELLED"]] as const)("persists %s → %s with the actual update time", async (from, to) => {
    const id = `${prefix}-${randomUUID()}`;
    const before = await appointment(id, from, "2026-11-19T09:00:00Z");
    try {
      const response = await update(id, { status: to });
      expect(response.status).toBe(200);
      const saved = await prisma.appointment.findUniqueOrThrow({ where: { id } });
      expect(await response.json()).toEqual({ appointment: { id, status: to, updatedAt: saved.updatedAt.toISOString() } });
      expect(saved.startsAt).toEqual(before.startsAt);
      expect(saved.endsAt).toEqual(before.endsAt);
      expect(saved.barberId).toBe(before.barberId);
      expect(saved.serviceId).toBe(before.serviceId);
    } finally { await prisma.appointment.delete({ where: { id } }); }
  });
  it.each(["CANCELLED", "COMPLETED", "NO_SHOW"] as const)("cannot change terminal status %s", async (from) => {
    for (const status of statuses) expect((await update(`${prefix}-${from}`, { status })).status).toBe(409);
  });
  it("rejects duplicates, backwards changes and unsupported target states", async () => {
    for (const status of ["CONFIRMED", "PENDING", "COMPLETED", "NO_SHOW"]) {
      expect((await update(`${prefix}-CONFIRMED`, { status })).status).toBe(409);
    }
    expect((await update(`${prefix}-PENDING`, { status: "PENDING" })).status).toBe(409);
  });
  it.each([{}, null, [], { status: "invalid" }, { status: 42 }, { status: "CANCELLED", startsAt: "2026-01-01" }])("rejects invalid update body %j", async (body) => {
    expect((await update(`${prefix}-PENDING`, body)).status).toBe(400);
  });
  it("validates IDs and returns 404 for missing appointments", async () => {
    expect((await update("invalid id", { status: "CANCELLED" })).status).toBe(400);
    const response = await update("missing-appointment", { status: "CANCELLED" });
    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe("NOT_FOUND");
  });
  it("allows only one of eight simultaneous confirmations", async () => {
    const id = `${prefix}-race`;
    await appointment(id, "PENDING", "2026-11-20T09:00:00Z");
    try {
      const responses = await Promise.all(Array.from({ length: 8 }, () => update(id, { status: "CONFIRMED" })));
      expect(responses.filter((response) => response.status === 200)).toHaveLength(1);
      expect(responses.filter((response) => response.status === 409)).toHaveLength(7);
      const success = await responses.find((response) => response.status === 200)!.json();
      const saved = await prisma.appointment.findUniqueOrThrow({ where: { id } });
      expect(success.appointment).toEqual({ id, status: saved.status, updatedAt: saved.updatedAt.toISOString() });
    } finally { await prisma.appointment.delete({ where: { id } }); }
  });
  it("never resurrects a cancelled appointment during competing updates", async () => {
    const id = `${prefix}-competing`;
    await appointment(id, "PENDING", "2026-11-20T09:00:00Z");
    try {
      const responses = await Promise.all([update(id, { status: "CANCELLED" }), update(id, { status: "CONFIRMED" })]);
      expect(responses.every((response) => [200, 409].includes(response.status))).toBe(true);
      const final = await prisma.appointment.findUniqueOrThrow({ where: { id } });
      // If confirmation won the compare-and-swap, cancellation may conflict;
      // a fresh cancellation succeeds, and confirmation can never undo it.
      if (final.status === "CONFIRMED") expect((await update(id, { status: "CANCELLED" })).status).toBe(200);
      expect((await update(id, { status: "CONFIRMED" })).status).toBe(409);
      expect((await prisma.appointment.findUniqueOrThrow({ where: { id } })).status).toBe("CANCELLED");
    } finally { await prisma.appointment.delete({ where: { id } }); }
  });
  it("cancellation frees availability and the database exclusion constraint", async () => {
    const startsAt = "2026-11-23T09:00:00.000Z";
    const id = `${prefix}-cancel`;
    const replacementId = `${prefix}-replacement`;
    const available = async () => (await (await availability(new NextRequest(`${origin}/api/availability?serviceId=${serviceId}&barberId=${barberId}&date=2026-11-23`))).json()).slots as { startsAt: string }[];
    await appointment(id, "PENDING", startsAt);
    try {
      expect((await available()).some((slot) => slot.startsAt === startsAt)).toBe(false);
      await expect(appointment(replacementId, "PENDING", startsAt)).rejects.toThrow();
      expect((await update(id, { status: "CANCELLED" })).status).toBe(200);
      expect((await available()).some((slot) => slot.startsAt === startsAt)).toBe(true);
      expect((await appointment(replacementId, "PENDING", startsAt)).status).toBe("PENDING");
    } finally { await prisma.appointment.deleteMany({ where: { id: { in: [id, replacementId] } } }); }
  });
});
