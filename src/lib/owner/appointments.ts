import "server-only";
import { DateTime } from "luxon";
import { AppointmentStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { BUSINESS_TIME_ZONE } from "@/lib/booking/availability";
import { OwnerApiError, validId } from "./http";

function invalid(message: string): never { throw new OwnerApiError(400, "INVALID_REQUEST", message); }

export function parseAppointmentQuery(params: URLSearchParams) {
  for (const key of params.keys()) {
    if (!["status", "barberId", "date", "page", "limit"].includes(key) || params.getAll(key).length !== 1) {
      invalid("Unknown or repeated query parameter.");
    }
  }
  const integer = (key: string, fallback: number) => {
    const value = params.get(key);
    if (value === null) return fallback;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) invalid(`Invalid ${key}.`);
    return Number(value);
  };
  const page = integer("page", 1);
  const limit = integer("limit", 20);
  const skip = (page - 1) * limit;
  if (limit > 100 || !Number.isSafeInteger(skip) || skip > 2_147_483_647) invalid("Page size or offset is too large.");
  const where: Prisma.AppointmentWhereInput = {};
  const status = params.get("status");
  if (status !== null) {
    if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) invalid("Invalid appointment status.");
    where.status = status as AppointmentStatus;
  }
  const barberId = params.get("barberId");
  if (barberId !== null) {
    if (!validId(barberId)) invalid("Invalid barber ID.");
    where.barberId = barberId;
  }
  const date = params.get("date");
  if (date !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith("0000")) invalid("Invalid date. Use YYYY-MM-DD.");
    const start = DateTime.fromISO(date, { zone: BUSINESS_TIME_ZONE }).startOf("day");
    if (!start.isValid || start.toISODate() !== date) invalid("Invalid calendar date.");
    where.startsAt = { gte: start.toJSDate(), lt: start.plus({ days: 1 }).toJSDate() };
  }
  return { where, page, limit, skip };
}

export async function listAppointments(params: URLSearchParams) {
  const { where, page, limit, skip } = parseAppointmentQuery(params);
  // Both queries see the same PostgreSQL snapshot, including during bookings.
  const [data, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where, skip, take: limit, orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      select: {
        id: true, startsAt: true, endsAt: true, status: true, priceCents: true,
        customerNotes: true, internalNotes: true,
        customer: { select: { name: true, email: true, phone: true } },
        service: { select: { id: true, name: true } },
        barber: { select: { id: true, name: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ], { isolationLevel: "RepeatableRead" });
  return { data, total, page, limit };
}

export function parseStatusBody(body: Record<string, unknown>): "CONFIRMED" | "CANCELLED" {
  if (Object.keys(body).length !== 1 || !("status" in body) ||
      typeof body.status !== "string" || !Object.values(AppointmentStatus).includes(body.status as AppointmentStatus)) {
    invalid("A valid appointment status is required.");
  }
  if (body.status !== "CONFIRMED" && body.status !== "CANCELLED") {
    throw new OwnerApiError(409, "INVALID_TRANSITION", "This status transition is not allowed.");
  }
  return body.status;
}

export async function updateAppointmentStatus(id: string, status: "CONFIRMED" | "CANCELLED") {
  if (!validId(id)) invalid("Invalid appointment ID.");
  return prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findUnique({ where: { id }, select: { status: true } });
    if (!current) throw new OwnerApiError(404, "NOT_FOUND", "Appointment not found.");
    if (!(current.status === "PENDING" || (current.status === "CONFIRMED" && status === "CANCELLED"))) {
      throw new OwnerApiError(409, "INVALID_TRANSITION", "This status transition is not allowed.");
    }
    // Compare-and-swap: PostgreSQL rechecks this status predicate after waiting
    // for a concurrent writer. A stale read can never overwrite newer state.
    const updated = await tx.appointment.updateManyAndReturn({
      where: { id, status: current.status }, data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
    if (updated.length !== 1) throw new OwnerApiError(409, "STATE_CONFLICT", "Appointment changed. Refresh and retry.");
    return updated[0];
  });
}
