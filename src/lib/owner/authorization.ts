import "server-only";
import { auth } from "@/lib/auth";
import { isBanned, isOwnerRole } from "./access";
import { OwnerApiError } from "./http";

export async function requireOwner(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true, disableRefresh: true },
  });
  if (!session) throw new OwnerApiError(401, "UNAUTHENTICATED", "Please sign in.");
  if (!isOwnerRole(session.user.role) || isBanned(session.user)) {
    throw new OwnerApiError(403, "FORBIDDEN", "Owner access required.");
  }
  return { id: session.user.id, email: session.user.email };
}
