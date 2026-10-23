import { requireOwner } from "@/lib/owner/authorization";
import { failure, json } from "@/lib/owner/http";

export async function GET(request: Request) {
  try { return json({ owner: await requireOwner(request) }); }
  catch (error) { return failure(error); }
}
