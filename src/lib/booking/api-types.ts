export type ApiService = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationMinutes: number;
};

export type ApiBarber = {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
};

export type AvailabilitySlot = {
  startsAt: string;
  localTime: string;
};

export type AvailabilityResponse = {
  date: string;
  timeZone: string;
  slots: AvailabilitySlot[];
};

export type BookingSuccessResponse = {
  appointment: {
    id: string;
    status: string;
    startsAt: string;
    endsAt: string;
  };
};
