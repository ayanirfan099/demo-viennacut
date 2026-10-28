import type { OwnerAppointmentStatus } from "@/lib/owner/api-types";
const colors: Record<OwnerAppointmentStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-900",
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-900",
  CANCELLED: "border-stone-300 bg-stone-100 text-stone-700",
  COMPLETED: "border-blue-200 bg-blue-50 text-blue-900",
  NO_SHOW: "border-red-200 bg-red-50 text-red-900",
};
export default function AppointmentStatusBadge({
  status,
}: {
  status: OwnerAppointmentStatus;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${colors[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
