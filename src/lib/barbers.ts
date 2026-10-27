import { demoBarbers } from "./catalog";
export type Barber = {
  id: string;
  name: string;
  bio: string;
};

export const barbers: Barber[] = demoBarbers.map(({ id, name, bio }) => ({ id, name, bio }));
