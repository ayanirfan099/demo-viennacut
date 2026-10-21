
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        bio: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error("Failed to fetch barbers:", error);

    return NextResponse.json(
      { error: "Unable to fetch barbers." },
      { status: 500 }
    );
  }
}
