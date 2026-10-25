import type { OwnerAppointment } from "./api-types";

export type DashboardSummary = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
};

export function summarizeAppointments(
  appointments: OwnerAppointment[],
): DashboardSummary {
  return {
    total: appointments.length,
    pending: appointments.filter((item) => item.status === "PENDING").length,
    confirmed: appointments.filter((item) => item.status === "CONFIRMED").length,
    cancelled: appointments.filter((item) => item.status === "CANCELLED").length,
  };
}
