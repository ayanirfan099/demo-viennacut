import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getOwnerAppointments,
  getOwnerSession,
  loginOwner,
  logoutOwner,
  OwnerApiError,
  ownerFetch,
  updateOwnerAppointment,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    }),
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("owner API client", () => {
  it("logs in using same-origin cookies", async () => {
    const fetchMock = mockResponse({
      owner: { id: "owner-1", email: "owner@example.com" },
    });

    const result = await loginOwner("owner@example.com", "password");

    expect(result.owner.id).toBe("owner-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/owner/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          email: "owner@example.com",
          password: "password",
        }),
      }),
    );

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("reports invalid credentials", async () => {
    mockResponse(
      { error: "Invalid credentials", code: "INVALID_CREDENTIALS" },
      401,
    );

    await expect(
      loginOwner("owner@example.com", "incorrect"),
    ).rejects.toMatchObject({
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  it("preserves rate-limit retry information", async () => {
    mockResponse(
      { error: "Too many attempts", code: "RATE_LIMITED" },
      429,
      { "Retry-After": "60" },
    );

    await expect(
      loginOwner("owner@example.com", "incorrect"),
    ).rejects.toMatchObject({
      status: 429,
      code: "RATE_LIMITED",
      retryAfter: "60",
    });
  });

  it("detects expired owner sessions", async () => {
    mockResponse(
      { error: "Unauthenticated", code: "UNAUTHENTICATED" },
      401,
    );

    await expect(getOwnerSession()).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHENTICATED",
    });
  });

  it("logs out using POST", async () => {
    const fetchMock = mockResponse({ success: true });

    expect((await logoutOwner()).success).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/owner/auth/logout",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("sends appointment filters", async () => {
    const fetchMock = mockResponse({
      data: [],
      total: 0,
      page: 2,
      limit: 20,
    });

    await getOwnerAppointments({
      status: "PENDING",
      date: "2026-10-28",
      page: 2,
      limit: 20,
    });

    const url = fetchMock.mock.calls[0][0] as string;
    const params = new URL(url, "http://localhost:3000").searchParams;

    expect(params.get("status")).toBe("PENDING");
    expect(params.get("date")).toBe("2026-10-28");
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("20");
  });

  it("updates appointment status", async () => {
    const fetchMock = mockResponse({
      appointment: {
        id: "appointment-1",
        status: "CONFIRMED",
        updatedAt: "2026-10-28T10:00:00.000Z",
      },
    });

    await updateOwnerAppointment("appointment-1", {
      status: "CONFIRMED",
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/owner/appointments/appointment-1",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
  });

  it("exposes appointment conflicts", async () => {
    mockResponse(
      { error: "State changed", code: "STATE_CONFLICT" },
      409,
    );

    await expect(
      updateOwnerAppointment("appointment-1", {
        status: "CANCELLED",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "STATE_CONFLICT",
    });
  });

  it("rejects invalid owner API paths", async () => {
    await expect(ownerFetch("/api/auth/session")).rejects.toThrow(
      "Invalid owner API path",
    );
  });

  it("returns a fallback message for unexpected errors", async () => {
    mockResponse(null, 500);

    await expect(getOwnerSession()).rejects.toEqual(
      expect.objectContaining({
        name: "OwnerApiError",
        status: 500,
        code: "UNKNOWN_ERROR",
      }),
    );

    expect(OwnerApiError).toBeDefined();
  });
});

describe("owner appointment request safety", () => {
  it("forwards AbortSignal to the appointments request", async () => {
    const fetchMock = mockResponse({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    const controller = new AbortController();

    await getOwnerAppointments(
      { page: 1, limit: 20 },
      controller.signal,
    );

    expect(fetchMock.mock.calls[0][1].signal).toBe(
      controller.signal,
    );
  });

  it("combines barber, status, date and pagination filters", async () => {
    const fetchMock = mockResponse({
      data: [],
      total: 0,
      page: 3,
      limit: 20,
    });

    await getOwnerAppointments({
      barberId: "barber-1",
      status: "CONFIRMED",
      date: "2026-10-25",
      page: 3,
      limit: 20,
    });

    const url = new URL(
      fetchMock.mock.calls[0][0],
      "http://localhost:3000",
    );

    expect(Object.fromEntries(url.searchParams)).toEqual({
      status: "CONFIRMED",
      barberId: "barber-1",
      date: "2026-10-25",
      page: "3",
      limit: "20",
    });
  });

  it("reports insufficient owner permissions", async () => {
    mockResponse(
      { error: "Forbidden", code: "FORBIDDEN" },
      403,
    );

    await expect(getOwnerAppointments()).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });

  it("reports invalid appointment transitions", async () => {
    mockResponse(
      {
        error: "Invalid status transition",
        code: "INVALID_TRANSITION",
      },
      409,
    );

    await expect(
      updateOwnerAppointment("appointment-1", {
        status: "CONFIRMED",
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: "INVALID_TRANSITION",
    });
  });
});

describe("owner logout safety", () => {
  it("reports logout server failures", async () => {
    mockResponse(
      { error: "Unable to log out", code: "INTERNAL_ERROR" },
      500,
    );

    await expect(logoutOwner()).rejects.toMatchObject({
      status: 500,
      code: "INTERNAL_ERROR",
    });
  });

  it("reports invalid origin during logout", async () => {
    mockResponse(
      { error: "Invalid origin", code: "INVALID_ORIGIN" },
      403,
    );

    await expect(logoutOwner()).rejects.toMatchObject({
      status: 403,
      code: "INVALID_ORIGIN",
    });
  });

  it("does not send authentication tokens in logout requests", async () => {
    const fetchMock = mockResponse({ success: true });

    await logoutOwner();

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(init.credentials).toBe("same-origin");
    expect(headers.has("Authorization")).toBe(false);
    expect(init.body).toBeUndefined();
  });
});
