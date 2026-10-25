import type {
  OwnerResponse,
  OwnerAppointmentsResponse,
  OwnerStatusUpdateRequest,
  OwnerStatusUpdateResponse,
} from "./api-types";

export class OwnerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly retryAfter: string | null = null,
  ) {
    super(message);
    this.name = "OwnerApiError";
  }
}

export async function ownerFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!path.startsWith("/api/owner/")) {
    throw new Error("Invalid owner API path");
  }

  const headers = new Headers(init.headers);

  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers,
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      body !== null &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : "Something went wrong. Please try again.";

    const code =
      body !== null &&
      typeof body === "object" &&
      "code" in body &&
      typeof body.code === "string"
        ? body.code
        : "UNKNOWN_ERROR";

    throw new OwnerApiError(
      error,
      response.status,
      code,
      response.headers.get("Retry-After"),
    );
  }

  return body as T;
}

export function loginOwner(email: string, password: string) {
  return ownerFetch<OwnerResponse>("/api/owner/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutOwner() {
  return ownerFetch<{ success: boolean }>("/api/owner/auth/logout", {
    method: "POST",
  });
}

export function getOwnerSession() {
  return ownerFetch<OwnerResponse>("/api/owner/auth/me");
}

export type OwnerAppointmentFilters = {
  status?: string;
  barberId?: string;
  date?: string;
  page?: number;
  limit?: number;
};

export function getOwnerAppointments(
  filters: OwnerAppointmentFilters = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.barberId) params.set("barberId", filters.barberId);
  if (filters.date) params.set("date", filters.date);
  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }
  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();

  return ownerFetch<OwnerAppointmentsResponse>(
    `/api/owner/appointments${query ? `?${query}` : ""}`,
    { signal },
  );
}

export function updateOwnerAppointment(
  appointmentId: string,
  data: OwnerStatusUpdateRequest,
) {
  return ownerFetch<OwnerStatusUpdateResponse>(
    `/api/owner/appointments/${encodeURIComponent(appointmentId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}
