"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const next = searchParams.get("next");

    router.replace(next || "/dashboard");
    router.refresh();
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <span className="text-sm font-bold text-violet-300">IP</span>
          </div>

          <span className="text-lg font-semibold tracking-tight">
            Interview<span className="text-violet-400">Pilot</span>
          </span>
        </Link>

        <div className="card p-7 sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Welcome back
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Continue your preparation.
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Sign in to access your interview cockpit.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
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
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
                {error}
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
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.06] pt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Create one
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-700">
          Your interview data is protected by Supabase Row Level Security.
        </p>
      </div>
    </main>
  );
}