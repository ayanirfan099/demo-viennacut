# Milestone 4 owner API — frontend handoff

The backend uses Better Auth 1.7.12 with PostgreSQL sessions. Customers still book without accounts. Owner frontend routes (`/owner/login`, `/owner/dashboard`, `/owner/appointments`, `/owner/calendar`) are Ayan's responsibility.

## Local configuration and verification

Use the existing WSL checkout at `/mnt/c/demo1/vienna-cuts` and its installed dependencies. `.env` needs:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vienna_cuts?schema=public"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS"
```

Generate the secret using a cryptographically secure generator (for example `openssl rand -base64 48`), and keep it in the untracked environment file or deployment secret store. The application refuses missing/short secrets. `BETTER_AUTH_URL` must be an exact HTTP(S) origin without a path, query, or credentials. Use the same hostname and port in the browser; `localhost` and `127.0.0.1` are different origins. Non-local origins require HTTPS. Configure the externally visible HTTPS origin behind a reverse proxy.

The existing authentication migration has already been applied. This implementation adds no migration. Do not reset or migrate either database as part of running these checks.

`.env.test` must contain `DATABASE_URL` for local `vienna_cuts_test`. Vitest explicitly loads this file and rejects any other database name, remote host, non-PostgreSQL URL, non-public schema, or connection query override. It uses a generated test-only auth secret and local origin. Existing integration suites share seed fixtures, so test files run sequentially; concurrency tests still issue simultaneous requests.

```bash
npm run typecheck
npm test -- --run
npm run lint
npx prisma validate --config prisma7.config.ts
npm run build
```

## Initial owner provisioning

The CLI creates one owner with role `admin`. It uses Better Auth's exported `hashPassword` implementation (the same default scrypt implementation as authentication), and creates the user and credential account in one transaction. A PostgreSQL advisory transaction lock prevents two bootstrap commands from creating different initial owners concurrently. Repeating the command for the existing owner does not change the password, name, or role. An existing non-owner is never promoted. A different second owner is refused.

**Development account creation requires Nehal's explicit approval.** No development owner has been provisioned by this implementation.

After approval, from an interactive WSL terminal with `.env` configured:

```bash
npm run owner:provision -- --database vienna_cuts
```

The command checks the local target, displays only host/port/database, asks you to type the database name, then prompts for email, name, and a hidden password. Passwords must contain 12–128 characters. Passwords are not accepted in command-line arguments, logged, or stored in source. For a test target, explicitly load its connection configuration and use `--database vienna_cuts_test`. A target mismatch aborts before creating records. Errors do not dump database details.

## Authentication contract

Requests and responses use JSON. Every owner response has `Cache-Control: no-store`. Login/logout/PATCH require an `Origin` exactly matching `BETTER_AUTH_URL`; missing, `null`, foreign origins and cross-site Fetch Metadata are rejected with 403 `INVALID_ORIGIN`. Browsers supply Origin automatically for same-origin mutations. CLI clients must supply it explicitly. There is no cross-origin dashboard support in this milestone.

Login and PATCH require `Content-Type: application/json`; bodies over 4096 bytes, malformed JSON, unknown body fields, and incorrect types return 400. Authentication uses cookies only: do not read, store, or send a session token from JavaScript.

### POST /api/owner/auth/login

```json
{ "email": "owner@example.com", "password": "owner-supplied-password" }
```

200 response:

```json
{ "owner": { "id": "owner-id", "email": "owner@example.com" } }
```

The password is checked by Better Auth. A session can only be created for a non-banned user whose comma-separated roles include the complete `admin` role. An authenticated non-admin receives 403. Wrong passwords and unknown emails both return the same 401 `INVALID_CREDENTIALS` message. Email addresses are matched case-insensitively by Better Auth.

The response sets a signed, HttpOnly, host-only, SameSite=Lax cookie with Path=/ and a 12-hour maximum age. HTTPS configuration adds Secure and uses Better Auth's secure cookie name. Local HTTP development uses a non-Secure cookie. Sessions expire 12 hours after login; activity does not extend them. Cookie session caching is disabled, so database revocation and role changes take effect on subsequent requests.

Login uses Better Auth's HTTP handler internally to retain its router rate limiter and CSRF checks. A database-backed shared login bucket permits five credential attempts per 60-second rolling inactivity window; successful and failed attempts both count. Accepted attempts move the window forward. Excess requests return 429 `RATE_LIMITED` with a `Retry-After` header in seconds. Arbitrary `X-Forwarded-For` and `X-Real-IP` headers cannot create new buckets. This conservative shared limit is intentional for the single-owner demo; unrelated clients can temporarily exhaust it. A future multi-owner deployment should configure a verified proxy trust boundary before adding per-client buckets.

After successful login, the frontend redirects to `/owner/dashboard`. The backend itself returns JSON and does not redirect.

### POST /api/owner/auth/logout

No body is required. 200 response:

```json
{ "success": true }
```

Better Auth deletes the database session and clears authentication cookies. The wrapper checks that the old cookie no longer authenticates before reporting success, because this installed library catches session-deletion errors internally. A database failure can therefore return 500; retry instead of claiming logout succeeded. Missing, expired, and already-revoked sessions are handled safely and normally return 200. Logout does not require an admin role, allowing a demoted user to clear their session. The library's general auth rate limit also applies to logout (30 requests per 60 seconds).

### GET /api/owner/auth/me

200 response:

```json
{ "owner": { "id": "owner-id", "email": "owner@example.com" } }
```

Missing, forged, expired or revoked sessions return 401 `UNAUTHENTICATED`. A valid session belonging to a non-admin or currently banned user returns 403 `FORBIDDEN`. Authorization reads the current database user; client-side route guards are optional UX only.

### Generic Better Auth routes

Public `GET` and `POST /api/auth/*` return 404 `NOT_FOUND`. Use only the owner endpoints. This intentionally closes raw sign-in/session responses that expose tokens, along with unused admin, impersonation and account-management endpoints. Better Auth remains callable internally on the server. Public signup is also disabled in the library configuration. There is no customer account signup.

## GET /api/owner/appointments

Requires an owner session. Query parameters:

| Parameter | Behavior |
| --- | --- |
| `status` | Optional exact enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW` |
| `barberId` | Optional ID, 1–128 ASCII letters, digits, underscores or hyphens; unknown valid ID returns an empty list |
| `date` | Optional valid `YYYY-MM-DD` calendar date in `Europe/Vienna`, year 0001–9999 |
| `page` | Positive base-10 integer, default 1 |
| `limit` | Positive base-10 integer, default 20, maximum 100; values above 100 are rejected |

Unknown or repeated parameters, empty supplied values, invalid enums/dates, non-integer pagination, and offsets greater than 2,147,483,647 return 400. Filters combine with AND. Without a date/status filter, appointments of all dates/statuses are included. Ordering is `startsAt` ascending, then `id` ascending.

200 response:

```json
{
  "data": [{
    "id": "appointment-id",
    "startsAt": "2026-10-28T10:20:00.000Z",
    "endsAt": "2026-10-28T10:40:00.000Z",
    "status": "PENDING",
    "customer": { "name": "Test Customer", "email": "customer@example.com", "phone": null },
    "service": { "id": "service-id", "name": "Beard Trim" },
    "barber": { "id": "barber-id", "name": "Alex" },
    "priceCents": 1800,
    "customerNotes": null,
    "internalNotes": null
  }],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

All fields map directly to existing Prisma columns/relations. `priceCents` is the booking snapshot, not the service's current price. Customer email and phone can be null. Notes can be null. No customer IDs, authentication fields, or unrelated fields are returned. Timestamps serialize as UTC ISO 8601. Relation selections are batched rather than queried once per appointment. The data and total queries use one repeatable-read database snapshot.

No matches return `{ "data": [], "total": 0, "page": 1, "limit": 20 }` with the requested/default pagination. A page beyond the last page returns an empty `data` array while preserving the matching total.

### Calendar and daylight saving time

Reuse this endpoint with `date` for `/owner/calendar`. It filters appointment **start instants** using `[Vienna day start, next Vienna day start)`, converted to UTC with Luxon. The next boundary is computed by adding a local calendar day, not 24 hours. Examples:

| Vienna date | Inclusive UTC start | Exclusive UTC end | Duration |
| --- | --- | --- | --- |
| 2026-03-29 | 2026-03-28T23:00:00Z | 2026-03-29T22:00:00Z | 23 hours |
| 2026-10-25 | 2026-10-24T22:00:00Z | 2026-10-25T23:00:00Z | 25 hours |

Use `limit=100` and fetch each successive page until the number collected reaches `total` or an empty page is returned. Separate requests can observe intervening bookings/status changes; refresh the day after mutations. Display timestamps with an explicit `Europe/Vienna` timezone, regardless of the browser's timezone.

## PATCH /api/owner/appointments/:id

Requires an owner session, matching Origin, valid ID (same character/length rules as barber IDs), and a JSON body containing only `status`:

```json
{ "status": "CONFIRMED" }
```

200 response:

```json
{
  "appointment": {
    "id": "appointment-id",
    "status": "CONFIRMED",
    "updatedAt": "2026-10-22T18:00:00.000Z"
  }
}
```

`updatedAt` comes from the actual persisted Appointment row returned by the update. No migration or fabricated timestamp is used.

| Current state | Allowed target states |
| --- | --- |
| PENDING | CONFIRMED, CANCELLED |
| CONFIRMED | CANCELLED |
| CANCELLED, COMPLETED, NO_SHOW | None |

Unknown status strings or malformed bodies return 400. Recognized enum values representing unsupported targets (`PENDING`, `COMPLETED`, `NO_SHOW`), same-status changes, and other forbidden transitions return 409 `INVALID_TRANSITION`. For a valid supported update, a nonexistent ID returns 404. The endpoint cannot change times, barber, service, notes, or prices.

Updates run in a transaction with an atomic status predicate. If a competing request has changed the observed state, the write affects no rows and returns 409 `STATE_CONFLICT`. No stale state is overwritten. Requests that observe a later valid state can execute a subsequent allowed transition. On either 409 code, refresh the appointment list before offering another action.

Cancellation removes the appointment from the existing active-overlap/availability rules. The PostgreSQL exclusion constraint is unchanged and continues to protect PENDING/CONFIRMED bookings.

## Error contract

```json
{ "error": "Human-readable error message", "code": "ERROR_CODE" }
```

| HTTP | Code | Frontend action |
| --- | --- | --- |
| 400 | INVALID_REQUEST | Correct the request/input |
| 401 | INVALID_CREDENTIALS | Show login failure without disclosing email existence |
| 401 | UNAUTHENTICATED | Redirect protected pages to `/owner/login` |
| 403 | FORBIDDEN | Show insufficient-permissions message |
| 403 | INVALID_ORIGIN | Check same-origin deployment/configuration |
| 404 | NOT_FOUND | Appointment missing, or raw auth endpoint unavailable |
| 409 | INVALID_TRANSITION | Refresh and show permitted actions |
| 409 | STATE_CONFLICT | Refresh; another update won the race |
| 429 | RATE_LIMITED | Wait for `Retry-After` before retrying |
| 500 | INTERNAL_ERROR | Show a generic failure/retry message |

Errors never return database details, stack traces, password hashes, or session tokens. Use the stable code for decisions and `error` for display.

## Suggested frontend integration

Use relative URLs on the same origin. Do not use the raw Better Auth browser client endpoints, bearer tokens, or localStorage for authentication.

```ts
async function ownerFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const body = await response.json();
  if (response.status === 401 && path !== "/api/owner/auth/login") {
    window.location.assign("/owner/login");
  }
  if (!response.ok) {
    throw Object.assign(new Error(body.error), {
      status: response.status,
      code: body.code,
      retryAfter: response.headers.get("Retry-After"),
    });
  }
  return body;
}

// Login form: catch INVALID_CREDENTIALS and RATE_LIMITED for inline feedback.
await ownerFetch("/api/owner/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
window.location.assign("/owner/dashboard");

// Protected page/session check:
const { owner } = await ownerFetch("/api/owner/auth/me");

// Appointment/calendar data:
const result = await ownerFetch("/api/owner/appointments?date=2026-10-28&page=1&limit=100");

// Confirm/cancel, then refresh the list:
await ownerFetch(`/api/owner/appointments/${encodeURIComponent(appointmentId)}`, {
  method: "PATCH", body: JSON.stringify({ status: "CONFIRMED" }),
});

// Logout: redirect only after success.
await ownerFetch("/api/owner/auth/logout", { method: "POST" });
window.location.assign("/owner/login");
```

Import shared response/request types from `src/lib/owner/api-types.ts`. That file has no server-only imports and is safe for frontend type-only imports. The backend does not implement the owner pages or frontend tests.
