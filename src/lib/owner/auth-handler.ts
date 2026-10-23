import "server-only";
import { auth } from "@/lib/auth";
import { authOrigin } from "./config";
import { json } from "./http";

// Use the HTTP handler so Better Auth's router rate limiter and CSRF middleware
// run. Calling auth.api.signInEmail directly would bypass router rate limiting.
export function authRequest(request: Request, path: "/sign-in/email" | "/sign-out", body: unknown) {
  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  return auth.handler(new Request(`${authOrigin()}/api/auth${path}`, {
    method: "POST", headers, body: JSON.stringify(body),
  }));
}

export function authFailure(response: Response): Response {
  const status = response.status;
  if (status === 429) return json({ error: "Too many requests. Please try again later.", code: "RATE_LIMITED" }, 429, response.headers);
  if (status === 401) return json({ error: "Invalid email or password.", code: "INVALID_CREDENTIALS" }, 401);
  if (status === 403) return json({ error: "Owner access required.", code: "FORBIDDEN" }, 403);
  if (status === 400) return json({ error: "Invalid request.", code: "INVALID_REQUEST" }, 400);
  return json({ error: "Unable to process request.", code: "INTERNAL_ERROR" }, 500);
}
