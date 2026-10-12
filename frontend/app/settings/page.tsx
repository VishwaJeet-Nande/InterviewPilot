import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/settings");
  }

  const params = await searchParams;
  const section = params.section || "general";

  return (
    <main className="app-shell min-h-full">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Account controls
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Manage your Curion account and application preferences.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <aside className="card h-fit p-2">
            <div className="space-y-1">
              <a
                href="/settings"
                className={`block rounded-xl px-4 py-3 text-xs font-medium transition ${
                  section === "general"
                    ? "bg-violet-500/[0.08] text-violet-300"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                General
              </a>

              <a
                href="/settings?section=appearance"
                className={`block rounded-xl px-4 py-3 text-xs font-medium transition ${
                  section === "appearance"
                    ? "bg-violet-500/[0.08] text-violet-300"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                Appearance
              </a>

              <a
                href="/settings?section=privacy"
                className={`block rounded-xl px-4 py-3 text-xs font-medium transition ${
                  section === "privacy"
                    ? "bg-violet-500/[0.08] text-violet-300"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                Privacy
              </a>

              <a
                href="/settings?section=data"
                className={`block rounded-xl px-4 py-3 text-xs font-medium transition ${
                  section === "data"
                    ? "bg-violet-500/[0.08] text-violet-300"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
                }`}
              >
                Data & account
              </a>
            </div>
          </aside>

          <section className="card p-7 sm:p-8">
            {section === "appearance" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Appearance
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Dark workspace
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Curion currently uses its dark-first interface across the
                  application. The interface is designed around focused,
                  low-distraction preparation.
                </p>

                <div className="mt-7 rounded-2xl border border-violet-400/15 bg-violet-400/[0.04] p-5">
                  <p className="text-sm font-medium text-violet-200">
                    Curion Dark
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-600">
                    Active workspace appearance.
                  </p>
                </div>
              </>
            )}

            {section === "privacy" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Privacy
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Your career data
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Curion stores interview-related information associated with
                  your account so it can generate Interview DNA, preparation
                  recommendations, practice evaluations, and readiness
                  signals.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "Resume files are stored in your private resume storage.",
                    "Interview records are associated with your authenticated account.",
                    "Practice and mock results are used to calculate preparation and readiness signals.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-5 text-zinc-500"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}

            {section === "data" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  Data & account
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Account controls
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Your account is authenticated through Supabase. Use the
                  controls below to manage the current session.
                </p>

                <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-sm font-medium text-zinc-200">
                    Sign out
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-600">
                    End your current Curion session on this device.
                  </p>

                  <div className="mt-5">
                    <SignOutButton />
                  </div>
                </div>
              </>
            )}

            {section === "general" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  General
                </p>

                <h2 className="mt-3 text-2xl font-semibold">
                  Curion workspace
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                  Your workspace is built around one simple loop: understand
                  the role, identify your gaps, practice deliberately, and
                  measure your progress.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Interview DNA", "Understand role alignment."],
                    ["Preparation", "Focus on relevant gaps."],
                    ["Readiness", "Measure demonstrated progress."],
                  ].map(([title, description]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                    >
                      <p className="text-sm font-semibold text-zinc-200">
                        {title}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-zinc-600">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
