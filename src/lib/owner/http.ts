import "server-only";
import { unstable_rethrow } from "next/navigation";
import { authOrigin } from "./config";

export class OwnerApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function json(data: unknown, status = 200, sourceHeaders?: Headers): Response {
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" });
  for (const cookie of sourceHeaders?.getSetCookie() ?? []) headers.append("Set-Cookie", cookie);
  const retry = sourceHeaders?.get("Retry-After") ?? sourceHeaders?.get("X-Retry-After");
  if (retry) headers.set("Retry-After", retry);
  return Response.json(data, { status, headers });
}

export function failure(error: unknown): Response {
  // Cache Components uses framework exceptions to defer routes to request time.
  // Preserve that control flow instead of misreporting a server error at build.
  unstable_rethrow(error);
  if (error instanceof OwnerApiError) return json({ error: error.message, code: error.code }, error.status);
  // Do not log exceptions that may contain credentials, session tokens or SQL.
  console.error("Owner API request failed.");
  return json({ error: "Unable to process request.", code: "INTERNAL_ERROR" }, 500);
}

export function requireOrigin(request: Request): void {
  if (request.headers.get("origin") !== authOrigin() || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new OwnerApiError(403, "INVALID_ORIGIN", "A same-origin request is required.");
  }
}

export async function readObject(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new OwnerApiError(400, "INVALID_REQUEST", "A JSON request body is required.");
  }
  // Bound input before parsing, even when Content-Length is omitted or dishonest.
  const reader = request.body?.getReader();
  if (!reader) throw new OwnerApiError(400, "INVALID_REQUEST", "A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid object");
    return body as Record<string, unknown>;
  } catch {
    throw new OwnerApiError(400, "INVALID_REQUEST", "Invalid JSON request body (maximum 4096 bytes).");
  } finally {
    reader.releaseLock();
  }
}

export function validId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}
