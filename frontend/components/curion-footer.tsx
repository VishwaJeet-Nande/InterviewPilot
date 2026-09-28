import Link from "next/link";

export default function CurionFooter() {
  return (
    <footer className="mt-16 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* BRAND */}

          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.08] text-sm font-bold text-violet-300">
                C
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Curion</p>

                <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-zinc-600">
                  Career Intelligence
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-xs leading-6 text-zinc-600">
              AI-powered career preparation built around understanding,
              deliberate practice, measurable progress, and better questions.
            </p>

            <p className="mt-5 text-xs font-medium text-violet-400">
              Curiosity. Intelligence. Progress.
            </p>
          </div>

          {/* PRODUCT */}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Product
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href="/interviews/new"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Interview DNA
              </Link>

              <Link
                href="/interviews/new"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Preparation
              </Link>

              <Link
                href="/interviews/new"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Practice
              </Link>

              <Link
                href="/interviews/new"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Mock Interviews
              </Link>
            </div>
          </div>

          {/* COMPANY */}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Company
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href="/about"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                About Curion
              </Link>

              <Link
                href="/about"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Our Philosophy
              </Link>

              <Link
                href="/about"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                How It Works
              </Link>

              <a
                href="mailto:hello@curion.ai"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Contact
              </a>
            </div>
          </div>

          {/* ACCOUNT / LEGAL */}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Account
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href="/account"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Profile
              </Link>

              <Link
                href="/settings"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Settings
              </Link>

              <Link
                href="/settings"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Privacy & Security
              </Link>

              <Link
                href="/settings"
                className="block text-xs text-zinc-600 transition hover:text-zinc-300"
              >
                Data & Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center">
          <p className="text-[10px] text-zinc-700">
            © 2026 Curion. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/about"
              className="text-[10px] text-zinc-700 transition hover:text-zinc-400"
            >
              About
            </Link>

            <Link
              href="/settings"
              className="text-[10px] text-zinc-700 transition hover:text-zinc-400"
            >
              Privacy
            </Link>

            <Link
              href="/settings"
              className="text-[10px] text-zinc-700 transition hover:text-zinc-400"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}