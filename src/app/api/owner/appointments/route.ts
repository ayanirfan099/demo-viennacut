import { requireOwner } from "@/lib/owner/authorization";
import { listAppointments } from "@/lib/owner/appointments";
import { failure, json } from "@/lib/owner/http";

export async function GET(request: Request) {
  try {
    await requireOwner(request);
    return json(await listAppointments(new URL(request.url).searchParams));
  } catch (error) { return failure(error); }
}
