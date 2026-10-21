import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        durationMinutes: true,
      },
    });

    return NextResponse.json(
      { services },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch services:", error);

    return NextResponse.json(
      { error: "Unable to fetch services." },
      { status: 500 }
    );
  }
}
