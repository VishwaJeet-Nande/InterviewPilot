"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function ReadinessPage() {
  const params = useParams();

  const interviewId = params.id as string;

  const [data, setData] =
    useState<ReadinessResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadReadiness() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/interviews/${interviewId}/readiness`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
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
      }
    }

    if (interviewId) {
      loadReadiness();
    }
  }, [interviewId]);

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

            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="text-xs text-zinc-500 hover:text-white"
            >
              ← Preparation
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-white/[0.05] py-3">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
            >
              Preparation Overview
            </Link>

            <Link
              href={`/interviews/${interviewId}/prepare/practice`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
            >
              Practice Answers
            </Link>

            <Link
              href={`/interviews/${interviewId}/mock`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
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

      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {loading && (
          <div className="py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
              Readiness Engine
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Calculating your readiness...
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Combining your Interview DNA and
              mock interview performance.
            </p>

            <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-500" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-300">
              Readiness Error
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Could not calculate readiness.
            </h1>

            <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] p-5 text-left text-sm text-rose-300">
              {error}
            </div>

            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="primary-button mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-semibold"
            >
              ← Back to Preparation
            </Link>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Readiness
              </p>

              <h1 className="mt-4 text-4xl font-semibold">
                Interview readiness
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
                Your readiness combines your role
                alignment, demonstrated mock-interview
                performance, and preparation baseline.
              </p>

              <p className="mt-3 text-sm text-zinc-600">
                {data.job_title} · {data.company_name}
              </p>
            </div>

            <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="card p-8 sm:p-10">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                      Overall readiness
                    </p>

                    <p className="mt-3 text-7xl font-semibold text-violet-300">
                      {data.readiness_score}
                    </p>

                    <p className="mt-2 text-sm text-zinc-600">
                      out of 100
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-4 py-2 text-xs font-semibold text-violet-300">
                      {data.level}
                    </span>

                    <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500 sm:ml-auto">
                      {data.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{
                        width: `${data.readiness_score}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="card p-8">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                  Readiness breakdown
                </p>

                <div className="mt-6 space-y-5">
                  {[
                    [
                      "Interview DNA",
                      data.breakdown.interview_dna,
                    ],
                    [
                      "Mock Interview",
                      data.breakdown.mock_interview,
                    ],
                    [
                      "Preparation",
                      data.breakdown.preparation,
                    ],
                  ].map(([label, score]) => (
                    <div key={label as string}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                          {label as string}
                        </span>

                        <span className="text-sm font-semibold">
                          {score as number}
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-violet-400"
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs leading-5 text-zinc-600">
                  Preparation is currently represented
                  by the Interview DNA baseline until
                  detailed preparation progress is persisted.
                </p>
              </div>
            </section>

            <section className="mt-8">
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
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {area.name}
                      </p>

                      <p className="text-lg font-semibold text-violet-300">
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

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Strengths
                </p>

                {data.strengths.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {data.strengths.map(
                      (item) => (
                        <li
                          key={item}
                          className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-sm leading-6 text-zinc-400"
                        >
                          • {item}
                        </li>
                      ),
                    )}
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
                    {data.priority_gaps.map(
                      (item) => (
                        <li
                          key={item}
                          className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4 text-sm leading-6 text-zinc-400"
                        >
                          • {item}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-zinc-600">
                    No priority gaps have been identified.
                  </p>
                )}
              </div>
            </section>

            <section className="card mt-8 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Recommended next actions
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.recommended_actions.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                    >
                      <p className="text-xs font-semibold text-violet-300">
                        0{index + 1}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/interviews/${interviewId}/prepare`}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
              >
                Review Preparation
              </Link>

              <Link
                href={`/interviews/${interviewId}/mock`}
                className="primary-button rounded-xl px-6 py-3 text-sm font-semibold"
              >
                {data.mock_completed
                  ? "Run Another Mock →"
                  : "Start Mock Interview →"}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}