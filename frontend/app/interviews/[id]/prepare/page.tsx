"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type Resource = {
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
};

type Module = {
  id: string;
  title: string;
  priority: string;
  current_score: number;
  why_this_matters: string;
  current_gap: string;
  learning_objectives: string[];
  practice_questions: string[];
  youtube_query: string;
  resources: Resource[];
};

type PreparationPlan = {
  summary: string;
  estimated_hours: number;
  modules: Module[];
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function PreparationPage({
  params,
}: Props) {
  const [interviewId, setInterviewId] =
    useState("");

  const [plan, setPlan] =
    useState<PreparationPlan | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedModule, setSelectedModule] =
    useState<Module | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setInterviewId(id);
      loadPreparation(id);
    });
  }, [params]);

  async function loadPreparation(id: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interviews/${id}/prepare`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Could not generate preparation plan.",
        );
      }

      setPlan(data);

      if (data.modules?.length) {
        setSelectedModule(data.modules[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Preparation generation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function priorityClass(priority: string) {
    if (priority === "HIGH") {
      return "border-rose-400/20 bg-rose-400/[0.05] text-rose-300";
    }

    if (priority === "MEDIUM") {
      return "border-amber-400/20 bg-amber-400/[0.05] text-amber-300";
    }

    return "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300";
  }

  if (loading) {
    return (
      <main className="app-shell min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
            Personalized preparation
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Building your preparation plan...
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            InterviewPilot is analyzing your Interview DNA,
            role requirements, risks, and experience.
          </p>

          <div className="mt-10 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-500" />
          </div>
        </div>
      </main>
    );
  }

  if (!plan) {
    return (
      <main className="app-shell min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="card p-8">
            <p className="text-sm text-rose-300">
              {error ||
                "Preparation plan could not be generated."}
            </p>

            <button
              type="button"
              onClick={() =>
                interviewId &&
                loadPreparation(interviewId)
              }
              className="primary-button mt-6 rounded-xl px-5 py-3 text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex h-12 items-center justify-between">
            <Link
              href={`/interviews/${interviewId}`}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                <span className="text-xs font-bold text-violet-300">
                  IP
                </span>
              </div>

              <span className="font-semibold">
                Interview
                <span className="text-violet-400">
                  Pilot
                </span>
              </span>
            </Link>

            <Link
              href={`/interviews/${interviewId}`}
              className="text-xs text-zinc-500 transition hover:text-white"
            >
              ← Interview DNA
            </Link>
          </div>

          {/* PRODUCT NAVIGATION */}
          <nav className="flex flex-wrap gap-2 border-t border-white/[0.05] py-3">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-lg border border-violet-400/25 bg-violet-400/[0.08] px-3 py-2 text-xs font-medium text-violet-300"
            >
              Preparation Overview
            </Link>

            <Link
              href={`/interviews/${interviewId}/prepare/practice`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
            >
              Practice Answers
            </Link>

            <Link
              href={`/interviews/${interviewId}/mock`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
            >
              Mock Interview
            </Link>

            <Link
              href={`/interviews/${interviewId}/readiness`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
            >
              Readiness Score
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Personalized preparation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your interview preparation plan
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            {plan.summary}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
              Preparation time
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {plan.estimated_hours}h
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
              Priority topics
            </p>

            <p className="mt-3 text-2xl font-semibold">
              {plan.modules.length}
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
              Practice mode
            </p>

            <p className="mt-3 text-2xl font-semibold">
              Text + Voice
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Preparation roadmap
            </p>

            {plan.modules.map((module) => (
              <button
                key={module.id}
                type="button"
                onClick={() => setSelectedModule(module)}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  selectedModule?.id === module.id
                    ? "border-violet-400/30 bg-violet-400/[0.06]"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.13]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {module.title}
                    </p>

                    <p className="mt-2 text-xs text-zinc-600">
                      Current alignment:{" "}
                      {module.current_score}%
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${priorityClass(
                      module.priority,
                    )}`}
                  >
                    {module.priority}
                  </span>
                </div>

                <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{
                      width: `${module.current_score}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            {selectedModule && (
              <>
                <div className="card p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-violet-400">
                        Current topic
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold">
                        {selectedModule.title}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${priorityClass(
                        selectedModule.priority,
                      )}`}
                    >
                      {selectedModule.priority} PRIORITY
                    </span>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                        Why this matters
                      </p>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {selectedModule.why_this_matters}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                        Your current gap
                      </p>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {selectedModule.current_gap}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-400">
                    Learn
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    What you need to understand
                  </h2>

                  <div className="mt-6 space-y-3">
                    {selectedModule.learning_objectives.map(
                      (objective, index) => (
                        <div
                          key={objective}
                          className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                          <span className="text-xs text-violet-400">
                            {String(index + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <p className="text-sm leading-6 text-zinc-400">
                            {objective}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="card p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-violet-400">
                        Recommended learning
                      </p>

                      <h2 className="mt-2 text-xl font-semibold">
                        Learn this faster
                      </h2>
                    </div>

                    <span className="text-xs text-zinc-600">
                      YouTube
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {selectedModule.resources.map(
                      (resource) => (
                        <a
                          key={resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-violet-400/20 hover:bg-violet-400/[0.03]"
                        >
                          {resource.thumbnail ? (
                            <img
                              src={resource.thumbnail}
                              alt=""
                              className="h-20 w-32 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-xl">
                              ▶
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 group-hover:text-white">
                              {resource.title}
                            </p>

                            <p className="mt-2 text-xs text-zinc-600">
                              {resource.channel}
                            </p>

                            <p className="mt-2 text-[11px] text-violet-300">
                              Watch on YouTube →
                            </p>
                          </div>
                        </a>
                      ),
                    )}
                  </div>
                </div>

                {/* PRACTICE QUESTIONS */}
                <div className="card p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-400">
                    Practice
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    Prove that you understand it
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Select a question to open the dedicated
                    practice workspace with text and voice
                    evaluation.
                  </p>

                  <div className="mt-6 space-y-3">
                    {selectedModule.practice_questions.map(
                      (question, index) => (
                        <Link
                          key={question}
                          href={`/interviews/${interviewId}/prepare/practice?question=${encodeURIComponent(
                            question,
                          )}`}
                          className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-violet-400/25 hover:bg-violet-400/[0.04]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-xs text-violet-400">
                              Q{index + 1}
                            </span>

                            <div className="flex-1">
                              <p className="text-sm leading-6 text-zinc-300 group-hover:text-white">
                                {question}
                              </p>

                              <p className="mt-3 text-xs font-medium text-violet-300 opacity-80 transition group-hover:opacity-100">
                                Practice this question →
                              </p>
                            </div>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>

                  <Link
                    href={`/interviews/${interviewId}/prepare/practice`}
                    className="mt-5 inline-flex rounded-xl border border-violet-400/20 bg-violet-400/[0.05] px-5 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-400/[0.1]"
                  >
                    Open Practice Workspace →
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}