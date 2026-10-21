
export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

export const services: Service[] = [
  {
    id: "classic-haircut",
    name: "Classic Haircut",
    description: "A precise cut tailored to your style.",
    price: 28,
    durationMinutes: 30,
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    description: "Clean lines and expert beard shaping.",
    price: 18,
    durationMinutes: 20,
  },
  {
    id: "haircut-beard",
    name: "Haircut & Beard",
    description: "The complete grooming experience.",
    price: 40,
    durationMinutes: 50,
  },
];
