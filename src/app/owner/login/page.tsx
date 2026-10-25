import type { Metadata } from "next";
import OwnerLoginForm from "@/components/owner/OwnerLoginForm";

export const metadata: Metadata = {
  title: "Owner Login | Vienna Cuts",
  description: "Secure owner dashboard login for Vienna Cuts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerLoginPage() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <section
        aria-labelledby="owner-login-title"
        className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm sm:p-10"
      >
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Vienna Cuts
          </p>

          <h1
            id="owner-login-title"
            className="text-3xl font-bold tracking-tight"
          >
            Owner Login
          </h1>

          <p className="mt-3 text-sm text-muted">
            Sign in to manage your barbershop appointments.
          </p>
        </div>

        <OwnerLoginForm />
      </section>
    </main>
  );
}
