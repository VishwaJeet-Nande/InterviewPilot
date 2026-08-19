"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const redirectUrl = `${window.location.origin}/auth/confirm`;

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email and confirm your address before signing in.",
    );

    setLoading(false);
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-10">
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
              Start preparing
            </p>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Build your interview profile.
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Your preparation will become personalized to you.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-300"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-zinc-300"
              >
                Confirm password
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
                placeholder="Repeat your password"
                className="input-field mt-2 px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-emerald-300">
                {message}
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
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.06] pt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
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