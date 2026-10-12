import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Profile",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Candidate";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0])
      .join("")
      .toUpperCase() || "C";

  return (
    <main className="app-shell min-h-full">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Account
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Your Curion account is intentionally simple. Your interview
            intelligence is built from the resumes and roles you analyze.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.7fr_1fr]">
          <section className="card p-7">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/15 bg-violet-500/[0.08] text-xl font-bold text-violet-300">
                {initials}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                {fullName}
              </h2>

              <p className="mt-2 text-xs text-zinc-600">
                Curion candidate
              </p>
            </div>
          </section>

          <section className="card p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Account information
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                  Name
                </p>

                <p className="mt-2 text-sm font-medium text-zinc-200">
                  {fullName}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-medium text-zinc-200">
                  {user.email || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                  Account ID
                </p>

                <p className="mt-2 break-all font-mono text-xs text-zinc-600">
                  {user.id}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="card mt-5 p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            Candidate model
          </p>

          <h2 className="mt-3 text-xl font-semibold">
            Your intelligence is built from real interview context.
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            Curion does not require a long onboarding questionnaire. Your
            resume, target job description, preparation activity, practice
            answers, and mock interviews progressively create the context
            used by your Interview DNA.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Resume", "Your actual experience"],
              ["02", "Role", "The job you are targeting"],
              ["03", "Practice", "Your demonstrated performance"],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <span className="text-[10px] font-semibold text-violet-400">
                  {number}
                </span>

                <p className="mt-3 text-sm font-semibold text-zinc-200">
                  {title}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
