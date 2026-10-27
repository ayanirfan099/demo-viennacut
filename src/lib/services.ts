import { demoServices } from "./catalog";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

export const services: Service[] = demoServices.map(service => ({
  id: service.id, name: service.name, description: service.description,
  price: service.priceCents / 100, durationMinutes: service.durationMinutes,
}));
