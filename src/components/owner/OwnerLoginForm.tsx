"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginOwner, OwnerApiError } from "@/lib/owner/api";

export default function OwnerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setRetryAfter(null);

    try {
      await loginOwner(email.trim(), password);
      router.replace("/owner/dashboard");
    } catch (caught) {
      if (caught instanceof OwnerApiError) {
        if (caught.code === "INVALID_CREDENTIALS") {
          setError("Incorrect email or password.");
        } else if (caught.code === "RATE_LIMITED") {
          setError("Too many login attempts. Please try again later.");
          setRetryAfter(caught.retryAfter);
        } else if (caught.code === "FORBIDDEN") {
          setError("This account does not have owner access.");
        } else {
          setError(caught.message);
        }
      } else {
        setError("Unable to connect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="owner-email"
          className="mb-2 block text-sm font-medium"
        >
          Email address
        </label>

        <input
          id="owner-email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          placeholder="owner@example.com"
          className="w-full rounded-md border border-border bg-white px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div>
        <label
          htmlFor="owner-password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="owner-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          className="w-full rounded-md border border-border bg-white px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p>{error}</p>

          {retryAfter && (
            <p className="mt-1">
              Retry after approximately {retryAfter} seconds.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in to dashboard"}
      </button>
    </form>
  );
}
