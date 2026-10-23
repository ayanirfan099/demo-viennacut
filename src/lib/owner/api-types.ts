export type Owner = { id: string; email: string };
export type OwnerResponse = { owner: Owner };
export type OwnerApiErrorResponse = { error: string; code: string };
export type OwnerAppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type OwnerAppointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: OwnerAppointmentStatus;
  customer: { name: string; email: string | null; phone: string | null };
  service: { id: string; name: string };
  barber: { id: string; name: string };
  priceCents: number;
  customerNotes: string | null;
  internalNotes: string | null;
};
export type OwnerAppointmentsResponse = { data: OwnerAppointment[]; total: number; page: number; limit: number };
export type OwnerStatusUpdateRequest = { status: "CONFIRMED" | "CANCELLED" };
export type OwnerStatusUpdateResponse = { appointment: { id: string; status: "CONFIRMED" | "CANCELLED"; updatedAt: string } };
