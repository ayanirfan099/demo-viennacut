import type {
  OwnerAppointmentStatus,
  OwnerStatusUpdateRequest,
} from "./api-types";

export function getAllowedAppointmentActions(
  status: OwnerAppointmentStatus,
): OwnerStatusUpdateRequest["status"][] {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["CANCELLED"];
    case "CANCELLED":
    case "COMPLETED":
    case "NO_SHOW":
      return [];
  }
}

export function isAppointmentConflict(
  status: number,
  code: string,
): boolean {
  return (
    status === 409 &&
    (code === "STATE_CONFLICT" ||
      code === "INVALID_TRANSITION")
  );
}
