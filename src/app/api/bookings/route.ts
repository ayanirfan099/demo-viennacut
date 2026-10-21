import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import {
  BUSINESS_TIME_ZONE,
  generateAvailableSlots,
  isSlotAvailable,
} from "@/lib/booking/availability";
import { validateBookingRequest } from "@/lib/booking/validate";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON request body.",
      },
      { status: 400 }
    );
  }

  const validation = validateBookingRequest(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Invalid booking request.",
        details: validation.errors,
      },
      { status: 400 }
    );
  }

  const { serviceId, barberId } = validation.data;

  try {
    const [service, barber] = await Promise.all([
      prisma.service.findFirst({
        where: {
          id: serviceId,
          isActive: true,
        },
        select: {
          id: true,
          durationMinutes: true,
          priceCents: true,
        },
      }),

      prisma.barber.findFirst({
        where: {
          id: barberId,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    if (!barber) {
      return NextResponse.json(
        { error: "Barber not found." },
        { status: 404 }
      );
    }

    const { startsAt } = validation.data;

    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60_000
    );

    // Temporary safeguard until appointment creation is enabled.
    if (endsAt <= startsAt) {
      return NextResponse.json(
        { error: "Invalid service duration." },
        { status: 500 }
      );
    }

    const localStart = DateTime.fromJSDate(startsAt, {
      zone: BUSINESS_TIME_ZONE,
    });

    const date = localStart.toISODate();

    if (!date) {
      return NextResponse.json(
        { error: "Invalid appointment date." },
        { status: 400 }
      );
    }

    const dayStart = localStart.startOf("day").toJSDate();

    const dayEnd = localStart
      .plus({ days: 1 })
      .startOf("day")
      .toJSDate();

    const dayOfWeek = localStart.weekday % 7;

    const [
      workingHours,
      appointments,
      blockedTimes,
    ] = await Promise.all([
      prisma.workingHour.findMany({
        where: {
          barberId,
          dayOfWeek,
        },
        select: {
          startMinute: true,
          endMinute: true,
        },
      }),

      prisma.appointment.findMany({
        where: {
          barberId,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
        select: {
          startsAt: true,
          endsAt: true,
        },
      }),

      prisma.blockedTime.findMany({
        where: {
          barberId,
          startsAt: {
            lt: dayEnd,
          },
          endsAt: {
            gt: dayStart,
          },
        },
        select: {
          startsAt: true,
          endsAt: true,
        },
      }),
    ]);

    const slots = generateAvailableSlots({
      date,
      durationMinutes: service.durationMinutes,
      workingPeriods: workingHours,
      appointments,
      blockedTimes,
    });

    if (!isSlotAvailable(slots, startsAt)) {
      return NextResponse.json(
        {
          error: "Requested appointment time is unavailable.",
        },
        { status: 409 }
      );
    }

    const appointment = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: validation.data.customer.name,
          email: validation.data.customer.email,
          phone: validation.data.customer.phone,
        },
      });

      return tx.appointment.create({
        data: {
          customerId: customer.id,
          barberId,
          serviceId,
          startsAt,
          endsAt,
          priceCents: service.priceCents,
          durationMinutes: service.durationMinutes,
          status: "PENDING",
          customerNotes: validation.data.customerNotes,
        },
      });
    });

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          status: appointment.status,
          startsAt: appointment.startsAt.toISOString(),
          endsAt: appointment.endsAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const isDoubleBookingConflict =
      error instanceof Error &&
      "code" in error &&
      error.code === "P2039" &&
      "meta" in error &&
      typeof error.meta === "object" &&
      error.meta !== null &&
      "modelName" in error.meta &&
      error.meta.modelName === "Appointment" &&
      error.message.includes("Appointment_no_active_overlap");

    if (isDoubleBookingConflict) {
      return NextResponse.json(
        { error: "Requested appointment time is unavailable." },
        { status: 409 }
      );
    }

    console.error("Failed to process booking request:", error);

    return NextResponse.json(
      { error: "Unable to process booking request." },
      { status: 500 }
    );
  }
}