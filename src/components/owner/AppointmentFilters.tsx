import type { OwnerAppointmentStatus } from "@/lib/owner/api-types";
import type { ApiBarber } from "@/lib/booking/api-types";

export type AppointmentFilterValues = {
  status: OwnerAppointmentStatus | "";
  barberId: string;
  date: string;
};

type Props = {
  values: AppointmentFilterValues;
  onChange: (values: AppointmentFilterValues) => void;
  disabled?: boolean;
  barbers: ApiBarber[];
};

const statuses: Array<OwnerAppointmentStatus | ""> = [
  "",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
];

export default function AppointmentFilters({
  values,
  onChange,
  disabled = false,
  barbers,
}: Props) {
  return (
    <div className="mb-6 grid gap-4 rounded-xl border border-border bg-white p-5 sm:grid-cols-3">
      <div>
        <label htmlFor="appointment-status" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <select
          id="appointment-status"
          value={values.status}
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...values,
              status: event.target.value as OwnerAppointmentStatus | "",
            })
          }
          className="w-full rounded-md border border-border bg-white px-3 py-3"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status ? status.replace("_", " ") : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="appointment-barber" className="mb-2 block text-sm font-medium">
          Barber
        </label>
        <select
          id="appointment-barber"
          value={values.barberId}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...values, barberId: event.target.value })
          }
          className="w-full rounded-md border border-border bg-white px-3 py-3"
        >
          <option value="">All barbers</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="appointment-date" className="mb-2 block text-sm font-medium">
          Vienna date
        </label>
        <input
          id="appointment-date"
          type="date"
          value={values.date}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...values, date: event.target.value })
          }
          className="w-full rounded-md border border-border bg-white px-3 py-3"
        />
      </div>
    </div>
  );
}
