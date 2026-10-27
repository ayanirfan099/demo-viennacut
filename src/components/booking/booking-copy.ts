import type { ApiService } from "@/lib/booking/api-types";
import { demoServices } from "@/lib/catalog";
export function serviceCopy(service: ApiService, language: string) {
  const translated =
    language === "de"
      ? demoServices.find((s) => s.id === service.id)
      : undefined;
  return {
    name: translated?.deName ?? service.name,
    description: translated?.deDescription ?? service.description,
  };
}
export function formatPrice(cents: number, language: string) {
  return new Intl.NumberFormat(language === "de" ? "de-AT" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
