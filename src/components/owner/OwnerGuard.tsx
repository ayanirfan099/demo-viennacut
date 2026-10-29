"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getOwnerSession, OwnerApiError } from "@/lib/owner/api";
import type { Owner } from "@/lib/owner/api-types";
import OwnerNav from "@/components/owner/OwnerNav";

type OwnerGuardProps = {
  children: (owner: Owner) => ReactNode;
};

export default function OwnerGuard({ children }: OwnerGuardProps) {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const result = await getOwnerSession();

        if (active) {
          setOwner(result.owner);
        }
      } catch (caught) {
        if (!active) return;

        if (caught instanceof OwnerApiError && caught.status === 401) {
          router.replace("/owner/login");
          return;
        }

        if (caught instanceof OwnerApiError && caught.status === 403) {
          setError("Your account does not have owner permissions.");
        } else {
          setError("Unable to verify your session. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main
        lang="en"
        id="main"
        className="owner-workspace mx-auto max-w-6xl px-6 py-16"
      >
        <p role="status" className="text-muted">
          Verifying owner session...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        lang="en"
        id="main"
        className="owner-workspace mx-auto max-w-6xl px-6 py-16"
      >
        <div
          role="alert"
          className="rounded-lg border border-border bg-white p-6"
        >
          <h1 className="text-xl font-semibold">Access unavailable</h1>
          <p className="mt-2 text-muted">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-accent px-5 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!owner) return null;

  return (
    <>
      <OwnerNav />
      {children(owner)}
    </>
  );
}
