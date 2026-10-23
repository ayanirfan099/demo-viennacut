import { json } from "@/lib/owner/http";

// Better Auth remains available server-side through auth.handler/auth.api.
// Only the owner wrappers are public: raw sign-in/get-session expose tokens,
// and the admin plugin's account management is outside this milestone.
function unavailable() {
  return json({ error: "Endpoint not available.", code: "NOT_FOUND" }, 404);
}

export const GET = unavailable;
export const POST = unavailable;
