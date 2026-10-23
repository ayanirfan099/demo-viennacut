import { authRequest, authFailure } from "@/lib/owner/auth-handler";
import { failure, json, OwnerApiError, readObject, requireOrigin } from "@/lib/owner/http";

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const body = await readObject(request);
    if (Object.keys(body).some((key) => !["email", "password"].includes(key)) ||
        typeof body.email !== "string" || body.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ||
        typeof body.password !== "string" || body.password.length < 1 || body.password.length > 128) {
      throw new OwnerApiError(400, "INVALID_REQUEST", "A valid email and password are required.");
    }
    const response = await authRequest(request, "/sign-in/email", { email: body.email, password: body.password });
    if (!response.ok) return authFailure(response);
    const result = await response.json();
    return json({ owner: { id: result.user.id, email: result.user.email } }, 200, response.headers);
  } catch (error) { return failure(error); }
}
