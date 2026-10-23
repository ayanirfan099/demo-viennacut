import { auth } from "@/lib/auth";
import { authRequest, authFailure } from "@/lib/owner/auth-handler";
import { failure, json, OwnerApiError, requireOrigin } from "@/lib/owner/http";

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const response = await authRequest(request, "/sign-out", {});
    if (!response.ok) return authFailure(response);
    // The installed library catches database deletion errors on sign-out. Do
    // not report success if the old signed cookie still resolves to a session.
    const remaining = await auth.api.getSession({ headers: request.headers, query: { disableCookieCache: true, disableRefresh: true } });
    if (remaining) throw new OwnerApiError(500, "INTERNAL_ERROR", "Unable to sign out. Please retry.");
    return json({ success: true }, 200, response.headers);
  } catch (error) { return failure(error); }
}
