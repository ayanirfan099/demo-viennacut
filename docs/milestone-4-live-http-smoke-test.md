# Milestone 4 live HTTP smoke-test procedure

Status: **prepared, not executed**. Automated tests invoke the route handlers with real PostgreSQL and Better Auth; this procedure separately verifies requests through a running Next.js HTTP server.

## Approval boundary and database safety

Do not create the development owner or run this procedure until Nehal explicitly approves both owner provisioning and the disposable development booking/status writes described below. Do not commit, push, create a PR, or publish as part of this procedure.

Keep `vienna_cuts_test` reserved for automated fixtures. Do not provision a persistent test owner to support a manual HTTP run. The automated auth fixture intentionally creates the single initial owner and removes it afterward; a persistent admin would interfere with that fixture.

Before and after the automated suite, from the repository root in WSL:

```bash
npx tsx scripts/check-test-database.ts
```

This checks the local test target and queries aggregate counts inside a read-only transaction. It never prints connection credentials, user identities, hashes or session tokens. The expected clean state is zero users, owners, accounts and sessions; the existing auth migration and appointment exclusion constraint must be present. If an owner is found, stop and review it. Do not delete unknown accounts or reset either database to make a check pass.

## Preconditions for the later approved development run

1. Record explicit approval for creating the initial development owner and one clearly marked disposable booking. The run will create/revoke a login session, create a PENDING booking, confirm it, and cancel it. It will leave that booking CANCELLED as an audit record, not delete unrelated data.
2. Verify the server will use the existing local `vienna_cuts` database. Inspect only the parsed host/database and, if needed, `SELECT current_database()`; do not echo the connection string or dump the environment. The HTTP origin alone does not prove which database the server uses.
3. Ensure `.env` has the correct `BETTER_AUTH_URL` and a real random auth secret. Use the exact configured origin throughout; `localhost` and `127.0.0.1` are not interchangeable for origin checks. Use HTTPS on non-local deployments.
4. After owner-creation approval, run `npm run owner:provision -- --database vienna_cuts` interactively. Confirm the displayed target and enter credentials at its prompts. Do not send the password in chat, a command argument, a script literal, or a screenshot. Re-running must preserve the existing account's credentials.
5. Use the already-verified production build, or run `npm run build`, then start a dedicated local process with `npm run start -- --hostname 127.0.0.1 --port 3000`. If that port is occupied, identify the existing process; do not kill an unrelated server. A different port also requires a matching `BETTER_AUTH_URL` before starting that process.
6. Choose an active service, active barber, and available future Vienna-local slot from the public service/barber/availability APIs. Check business hours and current availability immediately before booking. Use fictional customer information only. Do not repurpose an existing customer's appointment.
7. Run the helper below from an interactive WSL terminal only after approval. It keeps credentials, cookies and responses in memory and prints only step labels, HTTP statuses, and a non-secret fixture marker for recovery. Do not run through a request recorder, verbose HTTP debugger, shell trace, or shared terminal recording. Do not paste responses, cookie headers or tokens into the report.

## Expected request sequence

Every mutation uses the configured `Origin`; JSON mutations use `Content-Type: application/json`. Requests must not follow redirects to another origin.

| Step | Request | Required result |
| --- | --- | --- |
| Anonymous check | GET `/api/owner/auth/me` | 401, `UNAUTHENTICATED` |
| Login | POST `/api/owner/auth/login`, email/password from hidden input | 200, owner `{id,email}`, session cookie; no JSON token |
| Current owner | GET `/api/owner/auth/me` with the in-memory cookie jar | 200, same owner |
| Listing | GET `/api/owner/appointments?page=1&limit=20` | 200, `{data,total,page,limit}` |
| Disposable fixture | POST `/api/bookings`, chosen service/barber/available UTC start and fictional customer with a unique smoke marker | 201, PENDING appointment; record its ID in memory |
| Fixture listing | GET `/api/owner/appointments?barberId=...&date=...&status=PENDING&limit=100&page=...` | Locate the exact newly created ID across all pages and verify its marker, service, barber and start |
| Confirm | PATCH that exact `/api/owner/appointments/:id`, `{status:"CONFIRMED"}` | 200, matching ID/status and parseable UTC `updatedAt`; listing shows CONFIRMED |
| Cancel | PATCH that same ID, `{status:"CANCELLED"}` | 200, matching ID/status and UTC `updatedAt`; listing shows CANCELLED |
| Logout | POST `/api/owner/auth/logout` | 200, `{success:true}`, cookies cleared |
| Replay check | GET `/api/owner/auth/me` using the pre-logout cookie retained only in memory | 401, `UNAUTHENTICATED` |

Stop on any unexpected response. A 429 is not a reason to bypass throttling or clear database rate-limit records; wait for the indicated retry interval before a deliberate retry. Never retry booking creation blindly after a timeout: the server may already have created the booking. Investigate the unique smoke marker through the protected listing first.

## Secret-safe interactive helper

Save this code to a local temporary file outside the repository and run it with Python 3 in an interactive terminal. The file contains no credentials. This is a prepared manual procedure, not a smoke test already executed in this review. Confirm that the server process and database match the approved target before typing the confirmation phrase.

```python
import copy
import getpass
import http.cookiejar
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

class Stop(Exception):
    pass

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def require(condition, message):
    if not condition:
        raise Stop(message)

def client(jar):
    return urllib.request.build_opener(
        urllib.request.ProxyHandler({}),
        NoRedirect(),
        urllib.request.HTTPCookieProcessor(jar),
    )

require(sys.stdin.isatty() and sys.stdout.isatty(), "Use a private interactive terminal; redirected input/output is refused.")
base = input("Approved exact local origin [http://localhost:3000]: ").strip() or "http://localhost:3000"
parsed = urllib.parse.urlsplit(base)
require(parsed.scheme in ("http", "https") and parsed.hostname in ("localhost", "127.0.0.1", "::1")
        and not parsed.username and not parsed.password and not parsed.query and not parsed.fragment
        and parsed.path == "", "Use an exact local HTTP(S) origin without a path.")
require(input("Type APPROVED DEVELOPMENT SMOKE to confirm existing approval: ") == "APPROVED DEVELOPMENT SMOKE",
        "Approval confirmation missing.")
jar = http.cookiejar.CookieJar()
http = client(jar)
logged_in = False
fixture_id = None
cancelled = False
marker = "m4-http-smoke-" + str(uuid.uuid4())
print("Non-secret fixture marker (retain for recovery): " + marker)

def call(label, method, path, expected, body=None, transport=None):
    headers = {"Origin": base, "Content-Type": "application/json"}
    payload = None if body is None else json.dumps(body).encode()
    request = urllib.request.Request(base + path, data=payload, headers=headers, method=method)
    try:
        response = (transport or http).open(request, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        status = response.code
        raw = response.read(2_000_000)
    print(label + ": HTTP " + str(status))
    require(status == expected, label + " returned an unexpected status; stop and review privately.")
    return json.loads(raw)

def find_fixture(status):
    page = 1
    while True:
        query = urllib.parse.urlencode({"barberId": barber, "date": day, "status": status, "page": page, "limit": 100})
        result = call("Fixture listing", "GET", "/api/owner/appointments?" + query, 200)
        for row in result["data"]:
            if row["id"] == fixture_id:
                require(row["customerNotes"] == marker and row["service"]["id"] == service
                        and row["barber"]["id"] == barber and row["status"] == status
                        and datetime.fromisoformat(row["startsAt"].replace("Z", "+00:00")) == start,
                        "Fixture identity did not match; do not change this appointment.")
                return row
        if not result["data"] or page * result["limit"] >= result["total"]:
            raise Stop("Exact disposable fixture was not found; do not update another appointment.")
        page += 1

try:
    require(call("Anonymous /me", "GET", "/api/owner/auth/me", 401)["code"] == "UNAUTHENTICATED",
            "Unexpected anonymous response.")
    email = input("Owner email: ").strip()
    password = getpass.getpass("Owner password (hidden): ")
    logged_in = True  # Also attempt logout if the login response is interrupted.
    try:
        login = call("Login", "POST", "/api/owner/auth/login", 200, {"email": email, "password": password})
    finally:
        password = None
    require(set(login) == {"owner"} and set(login["owner"]) == {"id", "email"}, "Unexpected login response shape.")
    session_cookies = [cookie for cookie in jar if cookie.name.endswith("session_token")]
    require(len(session_cookies) == 1 and session_cookies[0].has_nonstandard_attr("HttpOnly"), "Missing HttpOnly session cookie.")
    require(session_cookies[0].get_nonstandard_attr("SameSite", "").lower() == "lax", "Session cookie is missing SameSite=Lax.")
    if parsed.scheme == "https":
        require(session_cookies[0].secure, "HTTPS session cookie is missing Secure.")
    require(call("Current owner", "GET", "/api/owner/auth/me", 200) == login, "Current owner differs from login.")
    listing = call("Appointment listing", "GET", "/api/owner/appointments?page=1&limit=20", 200)
    require(set(listing) == {"data", "total", "page", "limit"}, "Unexpected listing shape.")
    service = input("Approved active service ID: ").strip()
    barber = input("Approved active barber ID: ").strip()
    instant = input("Approved available future UTC start (ISO 8601 ending in Z): ").strip()
    require(instant.endswith("Z"), "UTC start must end in Z.")
    start = datetime.fromisoformat(instant.replace("Z", "+00:00"))
    require(start > datetime.now(start.tzinfo), "Select a future slot.")
    day = start.astimezone(ZoneInfo("Europe/Vienna")).date().isoformat()
    query = urllib.parse.urlencode({"serviceId": service, "barberId": barber, "date": day})
    available = call("Availability", "GET", "/api/availability?" + query, 200)
    require(any(datetime.fromisoformat(slot["startsAt"].replace("Z", "+00:00")) == start for slot in available["slots"]),
            "Chosen slot is unavailable; no booking was submitted.")
    booking = call("Create disposable booking", "POST", "/api/bookings", 201, {
        "serviceId": service, "barberId": barber, "startsAt": instant,
        "customer": {"name": "Milestone 4 HTTP Smoke", "email": marker + "@example.com"},
        "customerNotes": marker,
    })
    fixture_id = booking["appointment"]["id"]
    require(booking["appointment"]["status"] == "PENDING", "Fixture was not pending.")
    path = "/api/owner/appointments/" + urllib.parse.quote(fixture_id, safe="")
    find_fixture("PENDING")
    for target, label in [("CONFIRMED", "Confirm"), ("CANCELLED", "Cancel")]:
        result = call(label, "PATCH", path, 200, {"status": target})["appointment"]
        require(result["id"] == fixture_id and result["status"] == target and result["updatedAt"].endswith("Z"),
                "Unexpected status update response.")
        datetime.fromisoformat(result["updatedAt"].replace("Z", "+00:00"))
        if target == "CANCELLED":
            cancelled = True
        find_fixture(target)
    replay_jar = http.cookiejar.CookieJar()
    for cookie in jar:
        replay_jar.set_cookie(copy.copy(cookie))
    require(call("Logout", "POST", "/api/owner/auth/logout", 200) == {"success": True}, "Unexpected logout response.")
    logged_in = False
    require(not any(cookie.name.endswith("session_token") for cookie in jar), "Session cookie was not cleared.")
    require(call("Replay old session", "GET", "/api/owner/auth/me", 401, transport=client(replay_jar))["code"] == "UNAUTHENTICATED",
            "Old session remained usable.")
    replay_jar.clear()
    print("PASS: full live HTTP sequence; disposable booking remains CANCELLED.")
except Stop as error:
    print("STOP: " + str(error))  # Only fixed messages above, never server bodies.
except (Exception, KeyboardInterrupt):
    print("STOP: request, input, or response validation failed; no sensitive details printed.")
finally:
    if fixture_id and not cancelled:
        print("ACTION REQUIRED: the disposable fixture may still be active. Inspect its unique smoke marker privately before cleanup.")
    if logged_in:
        try:
            call("Final logout attempt", "POST", "/api/owner/auth/logout", 200)
        except Exception:
            print("ACTION REQUIRED: logout could not be verified. Do not claim session invalidation.")
    jar.clear()
```

## If interrupted or a request fails

- Do not assume a booking/status write failed solely because the client timed out. Check the marked fixture's persisted state before retrying.
- If the booking remains PENDING or CONFIRMED, cancel only that exact fixture after checking its marker, barber, service and start. Existing approval covers cancellation of this disposable fixture, not unrelated records.
- If the booking ID was not received, privately search the fictional smoke customer/notes across the selected day's pages. The helper intentionally does not print customer data or response bodies. If identity cannot be established, stop for review rather than guessing.
- Always attempt logout and verify that a saved pre-logout cookie no longer authenticates. Clear in-memory jars and close the terminal afterwards. Never export cookie jars or paste them into reports.
- Leave the confirmed-then-cancelled fixture as a documented audit record unless Nehal separately approves targeted removal. Do not issue broad DELETE/TRUNCATE commands.
- Stop only the server process started for this run. Recheck that `vienna_cuts_test` still has no persistent owner before its next automated suite.

## Results to record

Record only: date/time, branch, non-secret origin/database name, build result, the non-secret fixture marker, HTTP statuses for each step, pass/fail of response-shape/identity/state checks, whether the fixture remains CANCELLED, and whether logout replay returned 401. Never include request credentials, response bodies, account hashes, cookies, tokens, environment dumps, or verbose network traces. This procedure itself makes no claim that the live run has occurred.
