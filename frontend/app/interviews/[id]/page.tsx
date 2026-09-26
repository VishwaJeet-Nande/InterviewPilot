import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type InterviewDNA = {
  overall_match: number;
  technical_match: number;
  backend_match: number;
  ai_ml_match: number;
  cloud_match: number;
  database_match: number;
  system_design_match: number;
  behavioral_match: number;

  likely_focus: {
    topic: string;
    category: string;
    likelihood: number;
  }[];

  high_risk_areas: string[];
  medium_risk_areas: string[];
  strong_areas: string[];
};

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-rose-300";
}

function scoreBar(score: number) {
  if (score >= 80) return "bg-emerald-400";
  if (score >= 60) return "bg-amber-400";
  return "bg-rose-400";
}

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

  const { data: dna } = await supabase
    .from("interview_dna")
    .select(
      "overall_match, technical_match, backend_match, ai_ml_match, cloud_match, database_match, system_design_match, behavioral_match, likely_focus, high_risk_areas, medium_risk_areas, strong_areas",
    )
    .eq("interview_id", id)
    .maybeSingle();

  const interviewDNA = dna as InterviewDNA | null;

  const scoreCards = interviewDNA
    ? [
        ["Technical", interviewDNA.technical_match],
        ["Backend", interviewDNA.backend_match],
        ["AI / ML", interviewDNA.ai_ml_match],
        ["Cloud", interviewDNA.cloud_match],
        ["Database", interviewDNA.database_match],
        ["System Design", interviewDNA.system_design_match],
        ["Behavioral", interviewDNA.behavioral_match],
      ]
    : [];

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
            className="text-xs text-zinc-500 transition hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Interview DNA
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {interview.job_title}
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {interview.company_name}
            </p>
          </div>

          <div
            className={`rounded-full border px-4 py-2 text-xs ${
              interviewDNA
                ? "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300"
                : "border-amber-400/15 bg-amber-400/[0.05] text-amber-300"
            }`}
          >
            {interviewDNA ? "Analysis ready" : "Analysis pending"}
          </div>
        </div>

        {!interviewDNA ? (
          <section className="card mt-8 p-8 sm:p-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                Interview intelligence
              </p>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                Your Interview DNA is being prepared.
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                The interview has been saved. Run the InterviewPilot analysis
                to compare the actual job description with your resume and
                generate your personalized interview profile.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["01", "Role match"],
                  ["02", "Risk detection"],
                  ["03", "Interview focus"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <span className="text-[11px] text-violet-400">
                      {number}
                    </span>

                    <p className="mt-2 text-sm text-zinc-300">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs text-zinc-600">
                The analysis endpoint is ready. Refresh this page after the
                backend has generated the Interview DNA.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Overall score + capability map */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="card flex flex-col items-center justify-center p-8 text-center sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Overall match
                </p>

                <div className="mt-6 flex h-40 w-40 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/[0.04]">
                  <div>
                    <p
                      className={`text-5xl font-semibold ${scoreTone(
                        interviewDNA.overall_match,
                      )}`}
                    >
                      {interviewDNA.overall_match}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      out of 100
                    </p>
                  </div>
                </div>

                <p className="mt-6 max-w-xs text-xs leading-5 text-zinc-600">
                  A role-specific estimate based on the evidence in your
                  resume and the supplied job description.
                </p>
              </div>

              <div className="card p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Capability map
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Where you stand
                    </h2>
                  </div>

                  <span className="text-xs text-zinc-600">
                    7 domains
                  </span>
                </div>

                <div className="mt-7 space-y-5">
                  {scoreCards.map(([label, value]) => (
                    <div key={label as string}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          {label as string}
                        </span>

                        <span
                          className={`font-medium ${scoreTone(
                            value as number,
                          )}`}
                        >
                          {value as number}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${scoreBar(
                            value as number,
                          )}`}
                          style={{
                            width: `${value as number}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Interview focus + risk areas */}
            <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                  Likely interview focus
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  What the interviewer may probe
                </h2>

                <div className="mt-6 space-y-3">
                  {interviewDNA.likely_focus?.map((item) => (
                    <div
                      key={`${item.category}-${item.topic}`}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {item.topic}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            {item.category}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs font-medium text-violet-300">
                          {item.likelihood}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <section className="card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
                    High-risk areas
                  </p>

                  <div className="mt-4 space-y-2">
                    {interviewDNA.high_risk_areas?.length ? (
                      interviewDNA.high_risk_areas.map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-rose-400/10 bg-rose-400/[0.035] px-3 py-2.5 text-xs leading-5 text-zinc-400"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600">
                        No high-risk areas identified.
                      </p>
                    )}
                  </div>
                </section>

                <section className="card p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                    Medium-risk areas
                  </p>

                  <div className="mt-4 space-y-2">
                    {interviewDNA.medium_risk_areas?.length ? (
                      interviewDNA.medium_risk_areas.map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-amber-400/10 bg-amber-400/[0.035] px-3 py-2.5 text-xs leading-5 text-zinc-400"
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600">
                        No medium-risk areas identified.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </section>

            {/* Strong areas */}
            <section className="mt-6 card p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Strong areas
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Evidence-backed strengths
                  </h2>
                </div>

                <Link
                  href={`/interviews/${id}/prepare`}
                  className="primary-button rounded-xl px-5 py-3 text-center text-sm font-semibold"
                >
                  Start preparation →
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {interviewDNA.strong_areas?.length ? (
                  interviewDNA.strong_areas.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-2 text-xs text-zinc-400"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-zinc-600">
                    No strong areas identified.
                  </p>
                )}
              </div>
            </section>

            {/* Interview details */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
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
              </div>

              <div className="card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Interview status
                </p>

                <p className="mt-4 text-sm font-medium text-zinc-200">
                  Analysis completed
                </p>

                <p className="mt-1 break-all text-xs text-zinc-600">
                  Interview ID: {interview.id}
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}