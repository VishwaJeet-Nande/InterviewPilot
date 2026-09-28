import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import CurionHeader from "@/components/curion-header";
import CurionFooter from "@/components/curion-footer";

type Interview = {
  id: string;
  job_title: string | null;
  company_name: string | null;
  status: string | null;
  created_at: string;
  job_description: string | null;
};

type DNARecord = {
  interview_id: string;
};

type PracticeRecord = {
  interview_id: string;
  score: number | null;
};

type MockRecord = {
  interview_id: string;
  completed: boolean | null;
  final_score?: number | null;
};

function getStatusLabel(status: string | null) {
  const normalized = (status || "").toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("completed") ||
    normalized.includes("finish")
  ) {
    return "Completed";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("active") ||
    normalized.includes("ready")
  ) {
    return "In progress";
  }

  return "In progress";
}

function getStatusClasses(status: string | null) {
  const label = getStatusLabel(status);

  if (label === "Completed") {
    return "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300";
  }

  return "border-violet-400/15 bg-violet-400/[0.05] text-violet-300";
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Recently";
  }
}

function getCompanyInitial(company: string | null) {
  return company?.trim().charAt(0).toUpperCase() || "C";
}

export default async function InterviewsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

if (error || !data?.claims?.sub) {
  redirect("/auth/login");
}

const claims = data.claims;

  const userId = claims.sub;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const { data: interviews } = await supabase
    .from("interviews")
    .select(
      "id, job_title, company_name, status, created_at, job_description",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const interviewList: Interview[] = interviews ?? [];

  const interviewIds = interviewList.map((interview) => interview.id);

  let dnaRows: DNARecord[] = [];
  let practiceRows: PracticeRecord[] = [];
  let mockRows: MockRecord[] = [];

  if (interviewIds.length > 0) {
    const { data: dnaData } = await supabase
      .from("interview_dna")
      .select("interview_id")
      .in("interview_id", interviewIds);

    const { data: practiceData } = await supabase
      .from("practice_attempts")
      .select("interview_id, score")
      .in("interview_id", interviewIds);

    const { data: mockData } = await supabase
      .from("mock_interview_sessions")
      .select("interview_id, completed, final_score")
      .in("interview_id", interviewIds);

    dnaRows = dnaData ?? [];
    practiceRows = practiceData ?? [];
    mockRows = mockData ?? [];
  }

  const dnaIds = new Set(dnaRows.map((row) => row.interview_id));

  const practiceByInterview = new Map<
    string,
    {
      count: number;
      average: number;
    }
  >();

  for (const row of practiceRows) {
    const existing = practiceByInterview.get(row.interview_id);

    const score =
      row.score !== null && Number.isFinite(Number(row.score))
        ? Number(row.score)
        : null;

    if (!existing) {
      practiceByInterview.set(row.interview_id, {
        count: 1,
        average: score ?? 0,
      });
    } else {
      const nextCount = existing.count + 1;

      const nextAverage =
        score === null
          ? existing.average
          : (existing.average * existing.count + score) / nextCount;

      practiceByInterview.set(row.interview_id, {
        count: nextCount,
        average: nextAverage,
      });
    }
  }

  const mockByInterview = new Map<
    string,
    {
      completed: boolean;
      score: number | null;
    }
  >();

  for (const row of mockRows) {
    mockByInterview.set(row.interview_id, {
      completed: row.completed === true,
      score:
        row.final_score !== null &&
        row.final_score !== undefined &&
        Number.isFinite(Number(row.final_score))
          ? Number(row.final_score)
          : null,
    });
  }

  const completedCount = interviewList.filter(
    (interview) => getStatusLabel(interview.status) === "Completed",
  ).length;

  const activeCount = interviewList.length - completedCount;

  const dnaCount = interviewList.filter((interview) =>
    dnaIds.has(interview.id),
  ).length;

  return (
    <main className="app-shell min-h-screen">
      <CurionHeader
        fullName={fullName}
        email={user?.email}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* PAGE HEADER */}

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-500/[0.07] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-purple-500/[0.04] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.7)]" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Career intelligence
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                My interviews
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Every opportunity gets its own Curion intelligence workspace,
                preparation system, practice history, and readiness journey.
              </p>
            </div>

            <Link
              href="/interviews/new"
              className="primary-button shrink-0 px-5 py-3 text-sm"
            >
              + New interview
            </Link>
          </div>
        </section>

        {/* OVERVIEW */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs text-zinc-600">Total opportunities</p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {interviewList.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Career paths analyzed
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">In progress</p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {activeCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Active preparation
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">Interview DNA</p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {dnaCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Roles analyzed
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">Completed</p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {completedCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Interview journeys completed
            </p>
          </div>
        </section>

        {/* FILTER BAR */}

        <section className="mt-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white"
              >
                All
              </button>

              <button
                type="button"
                className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
              >
                In progress
              </button>

              <button
                type="button"
                className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
              >
                Completed
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden text-[10px] text-zinc-700 sm:block">
                {interviewList.length}{" "}
                {interviewList.length === 1 ? "opportunity" : "opportunities"}
              </div>

              <div className="flex h-9 min-w-44 items-center rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-xs text-zinc-600">
                Search interviews
              </div>
            </div>
          </div>
        </section>

        {/* INTERVIEW LIST */}

        <section className="mt-5">
          {interviewList.length === 0 ? (
            <div className="card overflow-hidden">
              <div className="relative px-6 py-16 text-center sm:px-10">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" />

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] text-2xl text-violet-300">
                  +
                </div>

                <p className="relative mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/70">
                  Start your Curion journey
                </p>

                <h2 className="relative mt-3 text-xl font-semibold text-white">
                  Your interview workspace is empty.
                </h2>

                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
                  Add your first target role and resume. Curion will transform
                  them into an Interview DNA and personalized preparation
                  system.
                </p>

                <Link
                  href="/interviews/new"
                  className="primary-button relative mt-7 inline-flex px-6 py-3 text-sm"
                >
                  Create your first interview →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewList.map((interview) => {
                const practice = practiceByInterview.get(interview.id);

                const mock = mockByInterview.get(interview.id);

                const hasDNA = dnaIds.has(interview.id);

                const practiceAverage = practice
                  ? Math.round(practice.average)
                  : 0;

                return (
                  <article
                    key={interview.id}
                    className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015] transition duration-200 hover:border-violet-400/15 hover:bg-violet-400/[0.018]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        {/* IDENTITY */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] text-sm font-semibold text-violet-300">
                              {getCompanyInitial(interview.company_name)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate text-base font-semibold text-white">
                                  {interview.job_title || "Untitled role"}
                                </h2>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusClasses(
                                    interview.status,
                                  )}`}
                                >
                                  {getStatusLabel(interview.status)}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-zinc-500">
                                {interview.company_name ||
                                  "Company not specified"}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-zinc-600">
                                <span>
                                  Created {formatDate(interview.created_at)}
                                </span>

                                <span className="text-zinc-800">•</span>

                                <span>
                                  {interview.job_description
                                    ? "Job description added"
                                    : "Job description pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PROGRESS */}

                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:w-[430px]">
                          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                            <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                              DNA
                            </p>

                            <p className="mt-2 text-sm font-semibold text-white">
                              {hasDNA ? "Ready" : "Pending"}
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              {hasDNA ? "Analyzed" : "Not analyzed"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                            <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                              Practice
                            </p>

                            <p className="mt-2 text-sm font-semibold text-white">
                              {practice?.count ?? 0}
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              {practice
                                ? `${practiceAverage}% average`
                                : "No attempts"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                            <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                              Mock
                            </p>

                            <p className="mt-2 text-sm font-semibold text-white">
                              {mock?.completed
                                ? mock.score !== null
                                  ? mock.score
                                  : "Done"
                                : "—"}
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              {mock?.completed
                                ? "Completed"
                                : "Not completed"}
                            </p>
                          </div>

                          <div className="hidden rounded-xl border border-violet-400/10 bg-violet-400/[0.025] p-3 sm:block">
                            <p className="text-[8px] uppercase tracking-[0.15em] text-zinc-700">
                              Workspace
                            </p>

                            <p className="mt-2 text-sm font-semibold text-violet-300">
                              Open
                            </p>

                            <p className="mt-1 text-[9px] text-zinc-600">
                              Continue
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BAR */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/interviews/${interview.id}/prepare`}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
                          >
                            Overview
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/prepare/practice`}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
                          >
                            Practice
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/mock`}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
                          >
                            Mock interview
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/readiness`}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
                          >
                            Readiness
                          </Link>
                        </div>

                        <Link
                          href={`/interviews/${interview.id}/prepare`}
                          className="rounded-xl bg-violet-500 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-violet-400"
                        >
                          Open workspace →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM INSIGHT */}

        {interviewList.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-violet-400/10 bg-violet-500/[0.025]">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.06] text-violet-300">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Curion works best when you prepare against a real
                    opportunity.
                  </p>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-600">
                    Add another target role whenever your career direction
                    changes. Each interview gets its own intelligence profile,
                    preparation system, and readiness journey.
                  </p>
                </div>
              </div>

              <Link
                href="/interviews/new"
                className="shrink-0 rounded-xl border border-violet-400/15 bg-violet-500/[0.08] px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:border-violet-400/25 hover:bg-violet-500/[0.13]"
              >
                + Analyze another role
              </Link>
            </div>
          </section>
        )}
      </div>

      <CurionFooter />
    </main>
  );
}