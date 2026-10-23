import { requireOwner } from "@/lib/owner/authorization";
import { parseStatusBody, updateAppointmentStatus } from "@/lib/owner/appointments";
import { failure, json, readObject, requireOrigin } from "@/lib/owner/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireOrigin(request);
    await requireOwner(request);
    const { id } = await context.params;
    const status = parseStatusBody(await readObject(request));
    return json({ appointment: await updateAppointmentStatus(id, status) });
  } catch (error) { return failure(error); }
}
