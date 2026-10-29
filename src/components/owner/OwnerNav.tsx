"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutOwner, OwnerApiError } from "@/lib/owner/api";

const links = [
  { label: "Dashboard", href: "/owner/dashboard" },
  { label: "Appointments", href: "/owner/appointments" },
  { label: "Calendar", href: "/owner/calendar" },
];

export default function OwnerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const result = await logoutOwner();

      if (!result.success) {
        throw new Error("Logout could not be verified.");
      }

      router.replace("/owner/login");
      router.refresh();
    } catch (caught) {
      if (caught instanceof OwnerApiError) {
        setError(
          caught.status === 403
            ? "Logout was rejected. Check your application configuration."
            : caught.message,
        );
      } else {
        setError("Unable to log out. Please try again.");
      }
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav
      lang="en"
      aria-label="Owner navigation"
      className="owner-nav border-b border-border bg-white"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
            Studio workspace · Authorized owner
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-accent text-white"
                      : "text-foreground hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-auto max-w-6xl px-6 pb-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </nav>
  );
}
