/** Fictional demonstration catalogue. Shared by public pages and the local seed. */
export type DemoService = {
  id: string;
  name: string;
  description: string;
  deName: string;
  deDescription: string;
  priceCents: number;
  durationMinutes: number;
  sortOrder: number;
  category: "hair" | "beard" | "ritual";
};
export const demoServices: DemoService[] = [
  {
    id: "classic-haircut",
    name: "Classic Haircut",
    deName: "Klassischer Haarschnitt",
    description: "A precise cut tailored to your style.",
    deDescription:
      "Beratung, präziser Schnitt und ein Finish, das zu dir passt.",
    priceCents: 2800,
    durationMinutes: 30,
    sortOrder: 1,
    category: "hair",
  },
  {
    id: "beard-trim",
    name: "Beard Trim",
    deName: "Bartpflege",
    description: "Clean lines and expert beard shaping.",
    deDescription:
      "Klare Konturen, harmonische Form und ein gepflegtes Gefühl.",
    priceCents: 1800,
    durationMinutes: 20,
    sortOrder: 2,
    category: "beard",
  },
  {
    id: "haircut-beard",
    name: "Haircut & Beard",
    deName: "Haare & Bart",
    description: "The complete grooming experience.",
    deDescription: "Schnitt und Bartpflege, sorgfältig aufeinander abgestimmt.",
    priceCents: 4000,
    durationMinutes: 50,
    sortOrder: 3,
    category: "ritual",
  },
  {
    id: "skin-fade",
    name: "Skin Fade",
    deName: "Skin Fade",
    description: "Seamless transitions and a clean, individual finish.",
    deDescription: "Fließende Übergänge und ein klarer, individueller Look.",
    priceCents: 3500,
    durationMinutes: 45,
    sortOrder: 4,
    category: "hair",
  },
  {
    id: "premium-grooming",
    name: "The Complete Ritual",
    deName: "Das komplette Ritual",
    description: "A considered haircut, beard treatment and warm towel finish.",
    deDescription:
      "Haarschnitt, Bartbehandlung und ein entspannter Abschluss mit warmem Handtuch.",
    priceCents: 5800,
    durationMinutes: 70,
    sortOrder: 5,
    category: "ritual",
  },
];
export const demoBarbers = [
  {
    id: "barber-alex",
    name: "Alex",
    bio: "Classic cuts and modern grooming.",
    deBio: "Klassische Schnitte, moderne Formen und Zeit für deine Wünsche.",
    specialty: "Classic cuts · Scissor work",
  },
  {
    id: "barber-daniel",
    name: "Daniel",
    bio: "Precision fades and beard styling.",
    deBio: "Präzise Fades, klare Bartkonturen und ein Auge fürs Detail.",
    specialty: "Skin fades · Beard styling",
  },
];
