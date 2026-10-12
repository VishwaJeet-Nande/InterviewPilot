import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Preparation",
};

export default async function PreparationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/preparation");
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select("id, job_title, company_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="app-shell min-h-full">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Preparation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Choose an interview to prepare for.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Curion keeps preparation tied to the actual role you are
            targeting. Select an interview to continue with its Interview DNA,
            preparation plan, practice, and mock interview.
          </p>
        </div>

        {!interviews || interviews.length === 0 ? (
          <section className="card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/[0.08] text-lg font-bold text-violet-300">
              C
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No interview context yet.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
              Create your first interview and Curion will generate your
              personalized Interview DNA.
            </p>

            <Link
              href="/interviews/new"
              className="primary-button mt-7 inline-flex rounded-xl px-6 py-3 text-sm font-semibold"
            >
              Create interview →
            </Link>
          </section>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview) => (
              <Link
                key={interview.id}
                href={`/interviews/${interview.id}/prepare`}
                className="card group p-6 transition hover:-translate-y-0.5 hover:border-violet-400/15 hover:bg-violet-400/[0.02]"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-400">
                      Interview preparation
                    </p>

                    <h2 className="mt-2 text-lg font-semibold text-white">
                      {interview.job_title || "Untitled role"}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-600">
                      {interview.company_name || "Company not specified"}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition group-hover:border-violet-400/20 group-hover:text-violet-300">
                    Continue preparation →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
