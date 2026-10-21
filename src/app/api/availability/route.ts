
import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import {
  BUSINESS_TIME_ZONE,
  generateAvailableSlots,
} from "@/lib/booking/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const serviceId = searchParams.get("serviceId");
  const barberId = searchParams.get("barberId");
  const date = searchParams.get("date");

  // Validate required parameters.
  if (!serviceId || !barberId || !date) {
    return NextResponse.json(
      {
        error:
          "serviceId, barberId, and date are required.",
      },
      { status: 400 }
    );
  }

  // Validate the Vienna calendar date.
  const localDate = DateTime.fromISO(date, {
    zone: BUSINESS_TIME_ZONE,
  });

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !localDate.isValid ||
    localDate.toISODate() !== date
  ) {
    return NextResponse.json(
      { error: "Invalid date. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

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

    // Derive UTC boundaries from Vienna's local day.
    // This correctly handles 23-hour and 25-hour DST days.
    const dayStart = localDate.startOf("day").toJSDate();
    const dayEnd = localDate
      .plus({ days: 1 })
      .startOf("day")
      .toJSDate();

    const dayOfWeek = localDate.weekday % 7;

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

    return NextResponse.json(
      {
        date,
        timeZone: BUSINESS_TIME_ZONE,
        slots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Failed to fetch availability:",
      error
    );

    return NextResponse.json(
      { error: "Unable to fetch availability." },
      { status: 500 }
    );
  }
}
