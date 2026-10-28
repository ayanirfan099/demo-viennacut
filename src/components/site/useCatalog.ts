"use client";
import { useEffect, useState } from "react";
import type { ApiService, ApiBarber } from "@/lib/booking/api-types";
export function useCatalog() {
  const [data, setData] = useState<{
    services: ApiService[];
    barbers: ApiBarber[];
  } | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      ["/api/services", "/api/barbers"].map(async (url) => {
        const r = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!r.ok) throw Error("Catalog unavailable");
        return r.json();
      }),
    )
      .then(([services, barbers]) => {
        if (!controller.signal.aborted) {
          setData({ services: services.services, barbers: barbers.barbers });
          setError(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  return { data, error, retry: () => setRetry((n) => n + 1) };
}
