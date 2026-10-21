-- Enable GiST equality comparisons for text barber IDs.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Every appointment must have a positive duration.
ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_valid_time_range"
CHECK ("endsAt" > "startsAt");

-- Prevent overlapping active appointments for the same barber.
ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_no_active_overlap"
EXCLUDE USING gist (
    "barberId" WITH =,
    tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE (
    status IN (
        'PENDING'::"AppointmentStatus",
        'CONFIRMED'::"AppointmentStatus"
    )
);
