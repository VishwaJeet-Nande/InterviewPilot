import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import CurionHeader from "@/components/curion-header";
import CurionFooter from "@/components/curion-footer";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const firstName = fullName.split(" ")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, target_role, experience_level")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
    });
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select(
      "id, job_title, company_name, status, created_at, job_description",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const interviewList = interviews ?? [];
  const interviewCount = interviewList.length;

  const interviewIds = interviewList.map((interview) => interview.id);

  let dnaCount = 0;
  let practiceCount = 0;
  let practiceAverage = 0;
  let mockCompletedCount = 0;

  if (interviewIds.length > 0) {
    const { data: dnaRows } = await supabase
      .from("interview_dna")
      .select("interview_id")
      .in("interview_id", interviewIds);

    dnaCount = dnaRows?.length ?? 0;

    const { data: practiceRows } = await supabase
      .from("practice_attempts")
      .select("score")
      .in("interview_id", interviewIds);

    const practiceScores =
      practiceRows
        ?.map((row) => Number(row.score))
        .filter((score) => Number.isFinite(score)) ?? [];

    practiceCount = practiceScores.length;

    practiceAverage =
      practiceScores.length > 0
        ? Math.round(
            practiceScores.reduce((sum, score) => sum + score, 0) /
              practiceScores.length,
          )
        : 0;

    const { data: mockRows } = await supabase
      .from("mock_interview_sessions")
      .select("interview_id, completed")
      .in("interview_id", interviewIds);

    mockCompletedCount =
      mockRows?.filter((row) => row.completed === true).length ?? 0;
  }

  const latestInterview = interviewList[0] ?? null;

  return (
    <main className="app-shell min-h-screen">
      <CurionHeader
        fullName={fullName}
        email={user?.email}
      />

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] p-7 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.07] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-purple-500/[0.04] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Curion intelligence
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Welcome, {firstName}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Your personalized career intelligence workspace for
                understanding the role, discovering your gaps, practicing
                intelligently, and measuring interview readiness.
              </p>
            </div>

            <Link
              href="/interviews/new"
              className="primary-button shrink-0 px-5 py-3 text-sm"
            >
              + Create interview
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs text-zinc-600">Opportunities</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {interviewCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {interviewCount === 1
                ? "interview created"
                : "interviews created"}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">Interview DNA</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {dnaCount}/{interviewCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {dnaCount === interviewCount && interviewCount > 0
                ? "all analyzed"
                : "roles analyzed"}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">Practice</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {practiceCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {practiceCount > 0
                ? `${practiceAverage}% average score`
                : "no attempts yet"}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs text-zinc-600">Mock interviews</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {mockCompletedCount}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {mockCompletedCount > 0
                ? "completed sessions"
                : "none completed"}
            </p>
          </div>
        </section>

        {latestInterview && (
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Continue preparing
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                {latestInterview.job_title}
                <span className="ml-2 font-normal text-zinc-600">
                  · {latestInterview.company_name}
                </span>
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href={`/interviews/${latestInterview.id}/prepare`}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-violet-400/20 hover:bg-violet-400/[0.025]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  ✦
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  Interview overview
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Review your personalized preparation roadmap.
                </p>
                <span className="mt-4 block text-xs font-medium text-violet-300">
                  Open overview →
                </span>
              </Link>

              <Link
                href={`/interviews/${latestInterview.id}/prepare/practice`}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-violet-400/20 hover:bg-violet-400/[0.025]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                  ◇
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  Practice
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Answer personalized questions and get AI evaluation.
                </p>
                <span className="mt-4 block text-xs font-medium text-zinc-300">
                  Practice now →
                </span>
              </Link>

              <Link
                href={`/interviews/${latestInterview.id}/mock`}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-violet-400/20 hover:bg-violet-400/[0.025]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                  ◉
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  AI mock interview
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Simulate a real interview with answer-by-answer feedback.
                </p>
                <span className="mt-4 block text-xs font-medium text-zinc-300">
                  Start mock →
                </span>
              </Link>

              <Link
                href={`/interviews/${latestInterview.id}/readiness`}
                className="group rounded-2xl border border-violet-400/15 bg-violet-500/[0.05] p-5 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  ↗
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  Readiness
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Measure preparation progress, strengths, gaps, and next
                  actions.
                </p>
                <span className="mt-4 block text-xs font-medium text-violet-300">
                  View readiness →
                </span>
              </Link>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Opportunities
                </p>
                <h2 className="mt-2 font-semibold text-white">
                  Your interviews
                </h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Every role gets its own Curion preparation workspace.
                </p>
              </div>

              <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[10px] text-zinc-500">
                {interviewCount} total
              </span>
            </div>

            <div className="p-6">
              {interviewList.length > 0 ? (
                <div className="space-y-3">
                  {interviewList.map((interview) => (
                    <div
                      key={interview.id}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition-all duration-200 hover:border-violet-400/20 hover:bg-violet-400/[0.025]"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06] text-sm font-semibold text-violet-300">
                              {interview.company_name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {interview.job_title}
                              </p>
                              <p className="mt-1 truncate text-xs text-zinc-500">
                                {interview.company_name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1 text-[10px] font-medium text-violet-300">
                              {interview.status}
                            </span>

                            <span className="text-[10px] text-zinc-600">
                              Created{" "}
                              {new Date(
                                interview.created_at,
                              ).toLocaleDateString()}
                            </span>

                            <span className="text-[10px] text-zinc-700">
                              •
                            </span>

                            <span className="text-[10px] text-zinc-600">
                              {interview.job_description
                                ? "Job description added"
                                : "Job description pending"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/interviews/${interview.id}/prepare`}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/20 hover:bg-violet-400/[0.06] hover:text-white"
                          >
                            Overview
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/prepare/practice`}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/20 hover:bg-violet-400/[0.06] hover:text-white"
                          >
                            Practice
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/mock`}
                            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/20 hover:bg-violet-400/[0.06] hover:text-white"
                          >
                            Mock
                          </Link>

                          <Link
                            href={`/interviews/${interview.id}/readiness`}
                            className="rounded-xl bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-400"
                          >
                            Readiness →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-lg text-violet-300">
                    +
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white">
                    Your first interview starts here
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                    Add a job description and resume. Curion will build your
                    Interview DNA and personalized preparation system.
                  </p>

                  <Link
                    href="/interviews/new"
                    className="primary-button mt-6 inline-flex px-5 py-3 text-xs"
                  >
                    Create first interview →
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Candidate
              </p>

              <h2 className="mt-2 font-semibold text-white">
                Your profile
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Your current Curion candidate identity.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-sm font-semibold text-violet-300">
                  {fullName
                    .split(" ")
                    .slice(0, 2)
                    .map((part: string) => part[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {fullName}
                  </p>

                  <p className="mt-1 truncate text-xs text-zinc-600">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                  Target role
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {profile?.target_role ||
                    latestInterview?.job_title ||
                    "Will be inferred from interviews"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                  Experience level
                </p>

                <p className="mt-2 text-sm capitalize text-zinc-300">
                  {profile?.experience_level || "Not specified"}
                </p>
              </div>

              <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.035] p-4">
                <p className="text-xs font-medium text-violet-300">
                  Curion career intelligence
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-600">
                  Your interview history, preparation activity, and evaluation
                  data are connected to your candidate profile.
                </p>
              </div>

              <Link
                href="/account"
                className="block rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-center text-xs font-medium text-zinc-300 transition hover:border-violet-400/20 hover:bg-violet-400/[0.04] hover:text-white"
              >
                Manage profile →
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              Quick actions
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Your preparation workspace
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Jump directly into the part of your preparation workflow you
              need.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/interviews/new"
              className="group rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] p-5 transition hover:border-violet-400/30 hover:bg-violet-500/[0.11]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                +
              </div>

              <p className="mt-4 text-sm font-semibold text-white">
                New interview
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Analyze another role and build a fresh Interview DNA.
              </p>

              <span className="mt-4 block text-xs font-medium text-violet-300">
                Create →
              </span>
            </Link>

            <Link
              href={
                latestInterview
                  ? `/interviews/${latestInterview.id}/prepare/practice`
                  : "/interviews/new"
              }
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ◇
              </div>

              <p className="mt-4 text-sm font-semibold text-white">
                Practice questions
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Train on personalized questions and save every evaluation.
              </p>

              <span className="mt-4 block text-xs font-medium text-zinc-300">
                {latestInterview ? "Practice →" : "Create interview →"}
              </span>
            </Link>

            <Link
              href={
                latestInterview
                  ? `/interviews/${latestInterview.id}/mock`
                  : "/interviews/new"
              }
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ◉
              </div>

              <p className="mt-4 text-sm font-semibold text-white">
                AI mock interview
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Run a realistic interview and get evaluated answer by answer.
              </p>

              <span className="mt-4 block text-xs font-medium text-zinc-300">
                {latestInterview ? "Start mock →" : "Create interview →"}
              </span>
            </Link>

            <Link
              href={
                latestInterview
                  ? `/interviews/${latestInterview.id}/readiness`
                  : "/interviews/new"
              }
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5 transition hover:border-violet-400/20 hover:bg-violet-400/[0.025]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                ↗
              </div>

              <p className="mt-4 text-sm font-semibold text-white">
                Readiness report
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                See preparation progress, strengths, gaps, and next actions.
              </p>

              <span className="mt-4 block text-xs font-medium text-zinc-300">
                {latestInterview ? "View report →" : "Create interview →"}
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              The Curion system
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Built around your actual interview
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card card-hover p-6 transition duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-sm text-violet-300">
                ✦
              </div>

              <h3 className="mt-5 text-sm font-semibold text-white">
                Interview DNA
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Map job requirements against your resume and identify the
                areas most likely to matter in the interview.
              </p>
            </div>

            <div className="card card-hover p-6 transition duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-sm text-violet-300">
                ◇
              </div>

              <h3 className="mt-5 text-sm font-semibold text-white">
                Resume Defendability
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Surface claims, technologies, projects, and experience areas
                an interviewer may challenge.
              </p>
            </div>

            <div className="card card-hover p-6 transition duration-200">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-sm text-violet-300">
                ◉
              </div>

              <h3 className="mt-5 text-sm font-semibold text-white">
                Adaptive Practice
              </h3>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Practice with personalized questions and receive structured AI
                feedback on every answer.
              </p>
            </div>
          </div>
        </section>
      </div>

      <CurionFooter />
    </main>
  );
}