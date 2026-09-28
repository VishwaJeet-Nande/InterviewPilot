"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.67Z"
      />
      <path
        fill="#FBBC05"
        d="M6.53 13.75a5.86 5.86 0 0 1 0-3.5V7.72H3.28a9.74 9.74 0 0 0 0 8.56l3.25-2.53Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.22c1.43 0 2.72.49 3.74 1.46l2.8-2.8C16.84 3.32 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53c.77-2.31 2.93-4.03 5.47-4.03Z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const urlError = searchParams.get("error");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const next =
      searchParams.get("next") || "/dashboard";

    router.replace(next);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");

    const supabase = createClient();

    const next =
      searchParams.get("next") || "/dashboard";

    const redirectTo =
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: googleError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
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
              Welcome back
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Continue your preparation.
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Sign in to access your career intelligence.
            </p>
          </div>

          {(error || urlError) && (
            <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
              {error || urlError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">
              or
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-violet-400 transition hover:text-violet-300"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Your password"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
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
              Create an account
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-700">
          Your interview data is protected by Supabase Row Level
          Security.
        </p>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mx-auto h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}