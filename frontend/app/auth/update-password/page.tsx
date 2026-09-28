"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "This password recovery link is invalid or has expired. Please request a new one.",
        );
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1200);
  }

  if (checking) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-6">
        <div className="card w-full max-w-md p-8">
          <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        </div>
      </main>
    );
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
              Create a new password.
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Choose a new password for your Curion account.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
              {error}
            </div>
          )}

          {success ? (
            <div className="mt-8">
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-4 text-center text-sm text-emerald-300">
                Password updated successfully.
                <br />
                Redirecting you to your dashboard...
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 6 characters"
                  className="input-field mt-2 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Confirm new password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Repeat your new password"
                  className="input-field mt-2 px-4 py-3 text-sm"
                />
              </div>

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
                  ? "Updating password..."
                  : "Update password →"}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-7 border-t border-white/[0.06] pt-6 text-center text-sm text-zinc-500">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-violet-400 hover:text-violet-300"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}