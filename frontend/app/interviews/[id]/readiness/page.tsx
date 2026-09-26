"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type ReadinessArea = {
  name: string;
  score: number;
  explanation: string;
};

type ReadinessResponse = {
  interview_id: string;
  job_title: string;
  company_name: string;
  readiness_score: number;
  level: string;
  summary: string;
  breakdown: {
    interview_dna: number;
    mock_interview: number;
    preparation: number;
  };
  strengths: string[];
  priority_gaps: string[];
  recommended_actions: string[];
  areas: ReadinessArea[];
  mock_score: number;
  dna_score: number;
  mock_completed: boolean;
};

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-300";
  if (score >= 70) return "text-violet-300";
  if (score >= 55) return "text-amber-300";
  return "text-rose-300";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 55) return "Developing";
  return "Needs Work";
}

export default function ReadinessPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [data, setData] =
    useState<ReadinessResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadReadiness(
    showRefreshing = false,
  ) {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interviews/${interviewId}/readiness`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.detail ||
            "Could not load readiness.",
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load readiness.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (interviewId) {
      loadReadiness();
    }
  }, [interviewId]);

  const weakestArea = useMemo(() => {
    if (!data?.areas?.length) {
      return null;
    }

    return [...data.areas].sort(
      (a, b) => a.score - b.score,
    )[0];
  }, [data]);

  if (loading) {
    return (
      <main className="app-shell min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />

            <div className="mt-6 h-10 w-80 rounded bg-white/[0.06]" />

            <div className="mt-4 h-4 max-w-2xl rounded bg-white/[0.04]" />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="h-48 rounded-2xl bg-white/[0.03]" />
              <div className="h-48 rounded-2xl bg-white/[0.03]" />
              <div className="h-48 rounded-2xl bg-white/[0.03]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="app-shell min-h-screen">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-300">
            Readiness Error
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Could not calculate readiness.
          </h1>

          <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] p-5 text-left text-sm text-rose-300">
            {error ||
              "No readiness data was returned."}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                loadReadiness(true)
              }
              className="primary-button rounded-xl px-6 py-3 text-sm font-semibold"
            >
              Try Again
            </button>

            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-300"
            >
              Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const signals = [
    {
      label: "Interview DNA",
      value: data.breakdown.interview_dna,
      description:
        "How closely your resume and skills align with the role.",
    },
    {
      label: "Mock Interview",
      value: data.breakdown.mock_interview,
      description: data.mock_completed
        ? "Your demonstrated performance across the mock interview."
        : "Not included yet because the mock interview is incomplete.",
    },
    {
      label: "Preparation",
      value: data.breakdown.preparation,
      description:
        "Your current preparation baseline.",
    },
  ];

  return (
    <main className="app-shell min-h-screen">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex h-12 items-center justify-between">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="font-semibold"
            >
              Interview
              <span className="text-violet-400">
                Pilot
              </span>
            </Link>

            <button
              type="button"
              onClick={() =>
                loadReadiness(true)
              }
              disabled={refreshing}
              className="text-xs text-zinc-500 transition hover:text-white disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh score"}
            </button>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-white/[0.05] py-3">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Preparation Overview
            </Link>

            <Link
              href={`/interviews/${interviewId}/prepare/practice`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Practice Answers
            </Link>

            <Link
              href={`/interviews/${interviewId}/mock`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Mock Interview
            </Link>

            <Link
              href={`/interviews/${interviewId}/readiness`}
              className="rounded-lg border border-violet-400/25 bg-violet-400/[0.08] px-3 py-2 text-xs text-violet-300"
            >
              Readiness Score
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Interview Readiness
            </p>

            <h1 className="mt-4 text-4xl font-semibold">
              Your interview readiness
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
              A combined view of your role alignment,
              preparation baseline, and demonstrated
              interview performance.
            </p>

            <p className="mt-3 text-sm text-zinc-600">
              {data.job_title} ·{" "}
              {data.company_name}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs font-semibold text-zinc-300 hover:bg-white/[0.06]"
            >
              Preparation
            </Link>

            <Link
              href={`/interviews/${interviewId}/mock`}
              className="primary-button rounded-xl px-5 py-3 text-xs font-semibold"
            >
              {data.mock_completed
                ? "Run Mock Again →"
                : "Start Mock →"}
            </Link>
          </div>
        </div>

        {/* HERO */}

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card relative overflow-hidden p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/[0.08] blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                    Overall readiness
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span
                      className={`text-7xl font-semibold tracking-tight ${getScoreColor(
                        data.readiness_score,
                      )}`}
                    >
                      {data.readiness_score}
                    </span>

                    <span className="pb-3 text-sm text-zinc-600">
                      /100
                    </span>
                  </div>

                  <span className="mt-3 inline-flex rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-4 py-2 text-xs font-semibold text-violet-300">
                    {data.level}
                  </span>
                </div>

                <div className="max-w-md sm:text-right">
                  <p className="text-sm leading-7 text-zinc-400">
                    {data.summary}
                  </p>
                </div>
              </div>

              <div className="mt-10 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-700"
                  style={{
                    width: `${data.readiness_score}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* NEXT ACTION */}

          <div className="card p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
              What should I do next?
            </p>

            {data.mock_completed ? (
              <>
                <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
                  <p className="text-xs font-semibold text-emerald-300">
                    Mock interview completed
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {data.mock_score}
                    <span className="ml-1 text-sm text-zinc-600">
                      /100
                    </span>
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Your readiness now includes actual
                    interview performance.
                  </p>
                </div>

                {weakestArea && (
                  <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-5">
                    <p className="text-xs font-semibold text-amber-300">
                      Weakest alignment area
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {weakestArea.name}
                    </p>

                    <p
                      className={`mt-1 text-2xl font-semibold ${getScoreColor(
                        weakestArea.score,
                      )}`}
                    >
                      {weakestArea.score}
                      <span className="ml-1 text-xs text-zinc-600">
                        /100
                      </span>
                    </p>
                  </div>
                )}

                <Link
                  href={`/interviews/${interviewId}/prepare/practice`}
                  className="primary-button mt-5 block rounded-xl px-5 py-3 text-center text-sm font-semibold"
                >
                  Practice Weakest Area →
                </Link>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-5">
                  <p className="text-xs font-semibold text-amber-300">
                    One signal is still missing
                  </p>

                  <p className="mt-2 text-sm font-semibold">
                    Complete your AI mock interview
                  </p>

                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    Answer six role-specific questions
                    so InterviewPilot can measure your
                    actual interview performance.
                  </p>
                </div>

                <Link
                  href={`/interviews/${interviewId}/mock`}
                  className="primary-button mt-5 block rounded-xl px-5 py-3 text-center text-sm font-semibold"
                >
                  Complete Mock Interview →
                </Link>
              </>
            )}
          </div>
        </section>

        {/* BREAKDOWN */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
              Readiness signals
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Where your score comes from
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {signals.map((signal) => (
              <div
                key={signal.label}
                className="card p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {signal.label}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                      {signal.description}
                    </p>
                  </div>

                  <span
                    className={`text-2xl font-semibold ${getScoreColor(
                      signal.value,
                    )}`}
                  >
                    {signal.value}
                  </span>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all duration-500"
                    style={{
                      width: `${signal.value}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                  {getScoreLabel(signal.value)}
                </p>
              </div>
            ))}
          </div>

          {!data.mock_completed && (
            <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 text-xs leading-5 text-zinc-500">
              <span className="font-semibold text-amber-300">
                Note:
              </span>{" "}
              your current readiness does not yet include
              demonstrated mock-interview performance.
              Complete the mock to make the score more
              representative.
            </div>
          )}
        </section>

        {/* TECHNICAL AREAS */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
              Role alignment
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Your technical readiness
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.areas.map((area) => (
              <div
                key={area.name}
                className="card p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {area.name}
                  </p>

                  <p
                    className={`text-lg font-semibold ${getScoreColor(
                      area.score,
                    )}`}
                  >
                    {area.score}
                  </p>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{
                      width: `${area.score}%`,
                    }}
                  />
                </div>

                <p className="mt-4 text-xs leading-5 text-zinc-600">
                  {area.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STRENGTHS + GAPS */}

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
              Strong areas
            </p>

            {data.strengths.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {data.strengths.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-sm leading-6 text-zinc-400"
                  >
                    <span className="mr-2 text-emerald-300">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-zinc-600">
                No strengths have been recorded yet.
              </p>
            )}
          </div>

          <div className="card p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
              Priority gaps
            </p>

            {data.priority_gaps.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {data.priority_gaps.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 text-sm leading-6 text-zinc-400"
                  >
                    <span className="mr-2 text-amber-300">
                      !
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-zinc-600">
                No priority gaps have been identified.
              </p>
            )}
          </div>
        </section>

        {/* ACTION PLAN */}

        <section className="card mt-10 p-7 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Action plan
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Your next preparation moves
              </h2>
            </div>

            <span className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">
              Personalized from your Interview DNA
            </span>
          </div>

          {data.recommended_actions.length > 0 ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {data.recommended_actions.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/[0.05] text-xs font-semibold text-violet-300">
                        {String(index + 1).padStart(
                          2,
                          "0",
                        )}
                      </div>

                      <p className="text-sm leading-6 text-zinc-400">
                        {item}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-zinc-600">
              Complete more preparation activity to
              generate personalized actions.
            </p>
          )}
        </section>

        {/* FOOTER ACTIONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/interviews/${interviewId}/prepare`}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-center text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
          >
            ← Review Preparation
          </Link>

          <Link
            href={`/interviews/${interviewId}/mock`}
            className="primary-button rounded-xl px-6 py-3 text-center text-sm font-semibold"
          >
            {data.mock_completed
              ? "Run Another Mock →"
              : "Start AI Mock Interview →"}
          </Link>
        </div>
      </div>
    </main>
  );
}