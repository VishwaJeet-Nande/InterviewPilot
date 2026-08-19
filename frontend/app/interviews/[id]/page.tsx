import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InterviewDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (!claims?.sub) {
    redirect(`/auth/login?next=/interviews/${id}`);
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .select(
      "id, job_title, company_name, job_description, status, created_at, resume_id",
    )
    .eq("id", id)
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (error || !interview) {
    notFound();
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("file_name, file_type, file_size")
    .eq("id", interview.resume_id)
    .eq("user_id", claims.sub)
    .maybeSingle();

  return (
    <main className="app-shell min-h-screen">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <span className="text-xs font-bold text-violet-300">IP</span>
            </div>

            <span className="font-semibold tracking-tight">
              Interview<span className="text-violet-400">Pilot</span>
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Interview created
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {interview.job_title}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {interview.company_name}
            </p>
          </div>

          <div className="rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-4 py-2 text-xs text-amber-300">
            AI analysis coming next
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Job description
            </p>

            <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
              {interview.job_description}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Resume
              </p>

              <p className="mt-4 break-all text-sm font-medium text-white">
                {resume?.file_name || "Resume uploaded"}
              </p>

              {resume?.file_size && (
                <p className="mt-1 text-xs text-zinc-600">
                  {(resume.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                Next
              </p>

              <h2 className="mt-4 text-lg font-semibold">
                Build your Interview DNA.
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                The next InterviewPilot engine will analyze this job
                description and your resume to identify skills, gaps, likely
                questions, and high-risk interview areas.
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Interview successfully saved
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}