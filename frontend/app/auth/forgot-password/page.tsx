"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSent(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const redirectTo =
      `${window.location.origin}/auth/callback?next=/auth/update-password`;

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo,
        },
      );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center"
        >
          <img
            src="/branding/curion-ai-dark.png"
            alt="Curion AI"
            className="h-11 w-auto object-contain"
          />
        </Link>

        <div className="card p-7 sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Account recovery
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Reset your password.
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Enter your email and we'll send you a secure
              password recovery link.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
                {error}
              </div>
            )}

            {sent && (
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-emerald-300">
                Check your email for the password recovery
                link. If you don't see it, check your spam
                folder.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl px-5 py-3.5 text-sm font-semibold ${
                loading
                  ? "cursor-not-allowed bg-white/[0.06] text-zinc-600"
                  : "primary-button"
              }`}
            >
              {loading
                ? "Sending recovery email..."
                : "Send recovery email →"}
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.06] pt-6 text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}