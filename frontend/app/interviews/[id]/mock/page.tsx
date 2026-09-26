"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type Question = {
  id: string;
  question: string;
  category: string;
  difficulty: string;
};

type MockPlan = {
  questions: Question[];
};

type Evaluation = {
  transcript: string;
  technical_accuracy: number;
  completeness: number;
  relevance: number;
  structure: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  better_answer: string;
};

export default function MockInterviewPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [plan, setPlan] =
    useState<MockPlan | null>(null);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [scores, setScores] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [evaluating, setEvaluating] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [error, setError] =
    useState("");

  const recorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      streamRef.current?.getTracks().forEach(
        (track) => track.stop(),
      );
    };
  }, []);

  async function startInterview() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interviews/${interviewId}/mock/start`,
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
            "Could not start mock interview.",
        );
      }

      setPlan(data);
      setCurrentIndex(0);
      setScores([]);
      setEvaluation(null);
      setAnswer("");
      setFinished(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mock interview failed to start.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(
    textAnswer?: string,
    audioBlob?: Blob,
  ) {
    if (!plan) return;

    const question =
      plan.questions[currentIndex];

    if (!question) return;

    setEvaluating(true);
    setError("");
    setEvaluation(null);

    try {
      const formData = new FormData();

      formData.append(
        "question",
        question.question,
      );

      if (audioBlob) {
        formData.append(
          "audio",
          audioBlob,
          "mock-answer.webm",
        );
      } else {
        formData.append(
          "answer",
          textAnswer || "",
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/interviews/${interviewId}/mock/evaluate`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Answer evaluation failed.",
        );
      }

      setEvaluation(data);

      await fetch(
        `${API_BASE_URL}/api/v1/interviews/${interviewId}/mock/save`,
        {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
           question: question.question,
           category: question.category,
           difficulty: question.difficulty,
           score: data.overall_score,
           evaluation: data,
         }),
       },
   );

   setScores((previous) => [
      ...previous,
      data.overall_score,
  ]);

      if (data.transcript) {
        setAnswer(data.transcript);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Answer evaluation failed.",
      );
    } finally {
      setEvaluating(false);
    }
  }

  function nextQuestion() {
    if (!plan) return;

    if (
      currentIndex >=
      plan.questions.length - 1
    ) {
      setFinished(true);
      return;
    }

    setCurrentIndex(
      (index) => index + 1,
    );

    setAnswer("");
    setEvaluation(null);
    setError("");
  }

  async function startRecording() {
    setError("");

    if (
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError(
        "Voice recording is not supported by this browser.",
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder =
        new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data,
          );
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          },
        );

        stream.getTracks().forEach(
          (track) => track.stop(),
        );

        streamRef.current = null;

        await submitAnswer(
          undefined,
          blob,
        );
      };

      recorder.start();

      recorderRef.current = recorder;
      streamRef.current = stream;

      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current =
        setInterval(() => {
          setRecordingSeconds(
            (seconds) => seconds + 1,
          );
        }, 1000);
    } catch {
      setError(
        "Microphone access was denied or unavailable.",
      );
    }
  }

  function stopRecording() {
    if (!recorderRef.current) return;

    recorderRef.current.stop();
    recorderRef.current = null;

    setRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const currentQuestion =
    plan?.questions[currentIndex];

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce(
            (sum, score) => sum + score,
            0,
          ) / scores.length,
        )
      : 0;

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
              className="rounded-lg border border-violet-400/25 bg-violet-400/[0.08] px-3 py-2 text-xs text-violet-300"
            >
              Mock Interview
            </Link>

            <Link
              href={`/interviews/${interviewId}/readiness`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400"
            >
              Readiness Score
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        {!plan && !loading && (
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              AI Mock Interview
            </p>

            <h1 className="mt-4 text-4xl font-semibold">
              Let's simulate the interview.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
              InterviewPilot will ask role-specific questions
              based on your Interview DNA and evaluate each
              answer as you go.
            </p>

            {error && (
              <div className="mx-auto mt-6 max-w-xl rounded-xl border border-rose-400/15 bg-rose-400/[0.05] p-4 text-left text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={startInterview}
              className="primary-button mt-8 rounded-xl px-7 py-4 text-sm font-semibold"
            >
              Start AI Mock Interview →
            </button>

            <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["6", "Questions"],
                ["Text", "Answer mode"],
                ["Voice", "Answer mode"],
              ].map(([value, label]) => (
                <div
                  key={`${value}-${label}`}
                  className="card p-5"
                >
                  <p className="text-xl font-semibold">
                    {value}
                  </p>

                  <p className="mt-2 text-xs text-zinc-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
              AI Interviewer
            </p>

            <h1 className="mt-4 text-3xl font-semibold">
              Preparing your interview...
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Building questions around your role,
              experience, and highest-risk areas.
            </p>

            <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-500" />
            </div>
          </div>
        )}

        {plan && !finished && currentQuestion && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                  Live interview
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Question {currentIndex + 1} of{" "}
                  {plan.questions.length}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-zinc-600">
                  Current average
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {scores.length
                    ? `${averageScore}/100`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-violet-400 transition-all"
                style={{
                  width: `${
                    ((currentIndex + 1) /
                      plan.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="card mt-8 p-7 sm:p-10">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                  {currentQuestion.category}
                </span>

                <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Interviewer
              </p>

              <h1 className="mt-3 text-2xl font-semibold leading-9 sm:text-3xl">
                {currentQuestion.question}
              </h1>

              <textarea
                value={answer}
                onChange={(event) =>
                  setAnswer(event.target.value)
                }
                disabled={
                  evaluating || recording
                }
                rows={9}
                placeholder="Answer as if you're speaking directly to the interviewer..."
                className="input-field mt-8 resize-none px-4 py-4 text-sm leading-7 disabled:opacity-60"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={
                    evaluating ||
                    recording ||
                    !answer.trim()
                  }
                  onClick={() =>
                    submitAnswer(answer)
                  }
                  className="primary-button rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-40"
                >
                  {evaluating
                    ? "Evaluating..."
                    : "Submit answer"}
                </button>

                {!recording ? (
                  <button
                    type="button"
                    disabled={evaluating}
                    onClick={startRecording}
                    className="rounded-xl border border-violet-400/20 bg-violet-400/[0.05] px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-400/[0.1] disabled:opacity-40"
                  >
                    🎙 Answer with voice
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-6 py-3 text-sm font-semibold text-rose-300"
                  >
                    ● Stop recording{" "}
                    {recordingSeconds}s
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] p-4 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {evaluation && (
                <div className="mt-10 border-t border-white/[0.06] pt-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">
                        Answer evaluated
                      </p>

                      <p className="mt-2 text-4xl font-semibold">
                        {evaluation.overall_score}
                        <span className="ml-1 text-sm text-zinc-600">
                          /100
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      [
                        "Accuracy",
                        evaluation.technical_accuracy,
                      ],
                      [
                        "Complete",
                        evaluation.completeness,
                      ],
                      [
                        "Relevant",
                        evaluation.relevance,
                      ],
                      [
                        "Structure",
                        evaluation.structure,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
                      >
                        <p className="text-[9px] uppercase text-zinc-600">
                          {label as string}
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {value as number}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">
                      <p className="text-xs font-semibold text-emerald-300">
                        Strengths
                      </p>

                      <ul className="mt-3 space-y-2">
                        {evaluation.strengths.map(
                          (item) => (
                            <li
                              key={item}
                              className="text-xs leading-5 text-zinc-400"
                            >
                              • {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
                      <p className="text-xs font-semibold text-amber-300">
                        Improve
                      </p>

                      <ul className="mt-3 space-y-2">
                        {evaluation.improvements.map(
                          (item) => (
                            <li
                              key={item}
                              className="text-xs leading-5 text-zinc-400"
                            >
                              • {item}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="primary-button mt-8 w-full rounded-xl px-6 py-4 text-sm font-semibold"
                  >
                    {currentIndex ===
                    plan.questions.length - 1
                      ? "Finish Mock Interview →"
                      : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {finished && (
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Interview complete
            </p>

            <h1 className="mt-4 text-4xl font-semibold">
              Mock interview finished.
            </h1>

            <div className="card mx-auto mt-8 max-w-xl p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                Mock interview score
              </p>

              <p className="mt-3 text-6xl font-semibold text-violet-300">
                {averageScore}
              </p>

              <p className="mt-2 text-sm text-zinc-600">
                Based on {scores.length} evaluated answers
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Link
                  href={`/interviews/${interviewId}/prepare`}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.06]"
                >
                  Review Preparation
                </Link>

                <Link
                  href={`/interviews/${interviewId}/readiness`}
                  className="primary-button rounded-xl px-4 py-3 text-sm font-semibold"
                >
                  View Readiness →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}