import { NextResponse } from "next/server";
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

  // Appointment creation is intentionally disabled until
  // database concurrency protection is implemented.
  return NextResponse.json(
    {
      error: "Booking creation is not yet available.",
    },
    { status: 503 }
  );
}
