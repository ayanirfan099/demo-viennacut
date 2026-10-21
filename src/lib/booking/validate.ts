export type BookingRequest = {
  serviceId: string;
  barberId: string;
  startsAt: Date;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
  customerNotes?: string;
};

export type BookingValidationResult =
  | { success: true; data: BookingRequest }
  | { success: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requiredString(
  value: unknown,
  field: string,
  errors: string[],
  maxLength = 200
): string {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${field} is required`);
    return "";
  }

  const trimmed = value.trim();

  if (trimmed.length > maxLength) {
    errors.push(`${field} is too long`);
  }

  return trimmed;
}

export function validateBookingRequest(
  input: unknown,
  now: Date = new Date()
): BookingValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return {
      success: false,
      errors: ["Request body must be an object"],
    };
  }

  const serviceId = requiredString(
    input.serviceId,
    "serviceId",
    errors
  );

  const barberId = requiredString(
    input.barberId,
    "barberId",
    errors
  );

  let startsAt = new Date(NaN);

  if (
    typeof input.startsAt !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(input.startsAt)
  ) {
    errors.push("startsAt must be an ISO 8601 timestamp with timezone");
  } else {
    startsAt = new Date(input.startsAt);

    if (!Number.isFinite(startsAt.getTime())) {
      errors.push("startsAt is invalid");
    } else {
      const maxBookingDate = new Date(now.getTime());
      maxBookingDate.setUTCDate(maxBookingDate.getUTCDate() + 90);

      if (startsAt.getTime() <= now.getTime()) {
        errors.push("startsAt must be in the future");
      }

      if (startsAt.getTime() > maxBookingDate.getTime()) {
        errors.push("startsAt cannot be more than 90 days ahead");
      }
    }
  }

  if (!isRecord(input.customer)) {
    errors.push("customer must be an object");
  }

  const customer = isRecord(input.customer)
    ? input.customer
    : {};

  const name = requiredString(
    customer.name,
    "customer.name",
    errors,
    100
  );

  let email: string | undefined;

  if (customer.email !== undefined && customer.email !== "") {
    if (
      typeof customer.email !== "string" ||
      customer.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())
    ) {
      errors.push("customer.email is invalid");
    } else {
      email = customer.email.trim();
    }
  }

  let phone: string | undefined;

  if (customer.phone !== undefined && customer.phone !== "") {
    if (
      typeof customer.phone !== "string" ||
      customer.phone.trim().length > 30 ||
      !customer.phone.trim()
    ) {
      errors.push("customer.phone is invalid");
    } else {
      phone = customer.phone.trim();
    }
  }

  let customerNotes: string | undefined;

  if (
    input.customerNotes !== undefined &&
    input.customerNotes !== ""
  ) {
    if (
      typeof input.customerNotes !== "string" ||
      input.customerNotes.length > 1000
    ) {
      errors.push("customerNotes is invalid");
    } else {
      customerNotes = input.customerNotes.trim();
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      serviceId,
      barberId,
      startsAt,
      customer: {
        name,
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
      ...(customerNotes !== undefined ? { customerNotes } : {}),
    },
  };
}