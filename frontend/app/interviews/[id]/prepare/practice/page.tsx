"use client";

import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

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

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function moduleMatchesTarget(
  module: Module,
  target: string,
) {
  const normalizedTarget = normalize(target);

  if (!normalizedTarget) {
    return false;
  }

  const moduleId = normalize(module.id);
  const moduleTitle = normalize(module.title);
  const moduleGap = normalize(module.current_gap);
  const moduleObjectives = normalize(
    module.learning_objectives?.join(" ") || "",
  );
  const moduleQuery = normalize(
    module.youtube_query || "",
  );

  if (moduleId === normalizedTarget) {
    return true;
  }

  if (moduleTitle === normalizedTarget) {
    return true;
  }

  if (
    moduleId.includes(normalizedTarget) ||
    normalizedTarget.includes(moduleId)
  ) {
    return true;
  }

  if (
    moduleTitle.includes(normalizedTarget) ||
    normalizedTarget.includes(moduleTitle)
  ) {
    return true;
  }

  const targetWords = normalizedTarget
    .split(" ")
    .filter((word) => word.length >= 3);

  if (!targetWords.length) {
    return false;
  }

  const searchableText = [
    moduleId,
    moduleTitle,
    moduleGap,
    moduleObjectives,
    moduleQuery,
  ].join(" ");

  const matchedWords = targetWords.filter(
    (word) => searchableText.includes(word),
  );

  return (
    matchedWords.length >=
    Math.max(
      1,
      Math.ceil(targetWords.length * 0.5),
    )
  );
}

function getModuleMatchScore(
  module: Module,
  target: string,
) {
  const normalizedTarget = normalize(target);

  if (!normalizedTarget) {
    return 0;
  }

  const moduleId = normalize(module.id);
  const moduleTitle = normalize(module.title);
  const moduleGap = normalize(module.current_gap);
  const moduleObjectives = normalize(
    module.learning_objectives?.join(" ") || "",
  );
  const moduleQuery = normalize(
    module.youtube_query || "",
  );

  if (moduleId === normalizedTarget) {
    return 100;
  }

  if (moduleTitle === normalizedTarget) {
    return 95;
  }

  if (
    moduleId.includes(normalizedTarget) ||
    normalizedTarget.includes(moduleId)
  ) {
    return 90;
  }

  if (
    moduleTitle.includes(normalizedTarget) ||
    normalizedTarget.includes(moduleTitle)
  ) {
    return 85;
  }

  const targetWords = normalizedTarget
    .split(" ")
    .filter((word) => word.length >= 3);

  const searchableText = [
    moduleId,
    moduleTitle,
    moduleGap,
    moduleObjectives,
    moduleQuery,
  ].join(" ");

  if (!targetWords.length) {
    return 0;
  }

  const matchedWords = targetWords.filter(
    (word) => searchableText.includes(word),
  );

  return (
    (matchedWords.length /
      targetWords.length) *
    70
  );
}

function getTargetedModule(
  modules: Module[],
  target: string,
) {
  if (!target || !modules.length) {
    return null;
  }

  const exactMatch = modules.find((module) =>
    moduleMatchesTarget(module, target),
  );

  if (exactMatch) {
    return exactMatch;
  }

  const ranked = modules
    .map((module) => ({
      module,
      score: getModuleMatchScore(
        module,
        target,
      ),
    }))
    .sort(
      (a, b) => b.score - a.score,
    );

  if (
    ranked.length &&
    ranked[0].score >= 25
  ) {
    return ranked[0].module;
  }

  return null;
}

export default function PracticeAnswersPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const interviewId = params.id as string;

  const questionFromUrl =
    searchParams.get("question") || "";

  const moduleFromUrl =
    searchParams.get("module") || "";

  const [plan, setPlan] =
    useState<PreparationPlan | null>(null);

  const [selectedModule, setSelectedModule] =
    useState<Module | null>(null);

  const [selectedQuestion, setSelectedQuestion] =
    useState(questionFromUrl);

  const [answer, setAnswer] =
    useState("");

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [evaluating, setEvaluating] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

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
    loadPreparation();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      streamRef.current?.getTracks().forEach(
        (track) => track.stop(),
      );
    };
  }, []);

  async function loadPreparation() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/interviews/${interviewId}/prepare`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data =
        (await response.json()) as PreparationPlan & {
          detail?: string;
        };

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Could not load preparation plan.",
        );
      }

      setPlan(data);

      const modules =
        data.modules || [];

      let foundModule: Module | null = null;

      /*
       * Priority 1:
       * If a specific question exists in the URL,
       * find the module containing that question.
       */
      if (questionFromUrl) {
        foundModule =
          modules.find((module) =>
            module.practice_questions?.includes(
              questionFromUrl,
            ),
          ) || null;
      }

      /*
       * Priority 2:
       * If readiness sent ?module=Cloud,
       * resolve the actual preparation module.
       */
      if (!foundModule && moduleFromUrl) {
        foundModule =
          getTargetedModule(
            modules,
            moduleFromUrl,
          );
      }

      /*
       * Priority 3:
       * Fall back to the first module.
       */
      if (!foundModule) {
        foundModule =
          modules[0] || null;
      }

      setSelectedModule(foundModule);

      /*
       * If a question wasn't supplied in the URL,
       * automatically select the first question from
       * the targeted module.
       *
       * This makes readiness → practice flow
       * immediately actionable.
       */
      if (
        !questionFromUrl &&
        foundModule?.practice_questions?.length
      ) {
        setSelectedQuestion(
          foundModule.practice_questions[0],
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load preparation.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseQuestion(
    module: Module,
    question: string,
  ) {
    setSelectedModule(module);
    setSelectedQuestion(question);
    setAnswer("");
    setEvaluation(null);
    setError("");

    const params =
      new URLSearchParams();

    params.set(
      "module",
      module.id,
    );

    params.set(
      "question",
      question,
    );

    const newUrl =
      `/interviews/${interviewId}/prepare/practice?${params.toString()}`;

    window.history.replaceState(
      null,
      "",
      newUrl,
    );
  }

  async function savePracticeAttempt(
    evaluationData: Evaluation,
    answerMode: "text" | "voice",
  ) {
    if (
      !selectedQuestion ||
      !selectedModule
    ) {
      throw new Error(
        "Practice question context is missing.",
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/interviews/${interviewId}/practice/save`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          module_id:
            selectedModule.id,
          question:
            selectedQuestion,
          answer_mode:
            answerMode,
          score:
            evaluationData.overall_score,
          evaluation:
            evaluationData,
        }),
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          "Practice evaluation could not be saved.",
      );
    }

    return data;
  }

  async function evaluateText() {
    if (
      !selectedQuestion ||
      !answer.trim()
    ) {
      return;
    }

    setEvaluating(true);
    setEvaluation(null);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "question",
        selectedQuestion,
      );

      formData.append(
        "answer",
        answer,
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/v1/interviews/${interviewId}/evaluate-answer`,
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Answer evaluation failed.",
        );
      }

      await savePracticeAttempt(
        data,
        "text",
      );

      setEvaluation(data);
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

  async function startRecording() {
    setError("");

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices
        ?.getUserMedia
    ) {
      setError(
        "Voice recording is not supported by this browser.",
      );
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          },
        );

      const recorder =
        new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data,
            );
          }
        };

      recorder.onstop =
        async () => {
          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm",
              },
            );

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop(),
            );

          streamRef.current =
            null;

          chunksRef.current =
            [];

          await evaluateVoice(
            blob,
          );
        };

      recorder.start();

      recorderRef.current =
        recorder;

      streamRef.current =
        stream;

      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current =
        setInterval(() => {
          setRecordingSeconds(
            (seconds) =>
              seconds + 1,
          );
        }, 1000);
    } catch {
      setError(
        "Microphone access was denied or unavailable.",
      );
    }
  }

  function stopRecording() {
    if (
      !recorderRef.current
    ) {
      return;
    }

    recorderRef.current.stop();
    recorderRef.current =
      null;

    setRecording(false);

    if (timerRef.current) {
      clearInterval(
        timerRef.current,
      );

      timerRef.current =
        null;
    }
  }

  async function evaluateVoice(
    blob: Blob,
  ) {
    if (!selectedQuestion) {
      return;
    }

    setEvaluating(true);
    setEvaluation(null);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "question",
        selectedQuestion,
      );

      formData.append(
        "audio",
        blob,
        "answer.webm",
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/v1/interviews/${interviewId}/evaluate-answer`,
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Voice evaluation failed.",
        );
      }

      await savePracticeAttempt(
        data,
        "voice",
      );

      setEvaluation(data);

      if (data.transcript) {
        setAnswer(
          data.transcript,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Voice evaluation failed.",
      );
    } finally {
      setEvaluating(false);
    }
  }

  function priorityClass(
    priority: string,
  ) {
    if (priority === "HIGH") {
      return "border-rose-400/20 bg-rose-400/[0.05] text-rose-300";
    }

    if (
      priority === "MEDIUM"
    ) {
      return "border-amber-400/20 bg-amber-400/[0.05] text-amber-300";
    }

    return "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-300";
  }

  function startOverQuestion() {
    setAnswer("");
    setEvaluation(null);
    setError("");
  }

  if (loading) {
    return (
      <main className="app-shell min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
            Interview practice
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Loading your practice workspace...
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            InterviewPilot is loading your
            personalized questions.
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
                "Practice workspace could not be loaded."}
            </p>

            <button
              type="button"
              onClick={
                loadPreparation
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
              href={`/interviews/${interviewId}/prepare`}
              className="text-xs text-zinc-500 transition hover:text-white"
            >
              ← Preparation
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-white/[0.05] py-3">
            <Link
              href={`/interviews/${interviewId}/prepare`}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-violet-400/20 hover:bg-violet-400/[0.05] hover:text-white"
            >
              Preparation Overview
            </Link>

            <Link
              href={`/interviews/${interviewId}/prepare/practice`}
              className="rounded-lg border border-violet-400/25 bg-violet-400/[0.08] px-3 py-2 text-xs font-medium text-violet-300"
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
            Practice answers
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Practice like you're in the interview
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            Choose a personalized question,
            answer it by typing or speaking,
            and let InterviewPilot evaluate
            the substance of your answer.
          </p>
        </div>

        {selectedModule && (
          <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-400/[0.035] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Targeted practice
                </p>

                <h2 className="mt-2 text-base font-semibold text-zinc-200 sm:text-lg">
                  Focus:{" "}
                  {selectedModule.title}
                </h2>

                {moduleFromUrl && (
                  <p className="mt-2 text-xs text-zinc-500">
                    InterviewPilot opened this
                    practice module from your
                    readiness gap.
                  </p>
                )}
              </div>

              <span
                className={`shrink-0 self-start rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] ${priorityClass(
                  selectedModule.priority,
                )}`}
              >
                {
                  selectedModule.priority
                }{" "}
                PRIORITY
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-3">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              Questions
            </p>

            {plan.modules.map(
              (module) => (
                <div
                  key={module.id}
                  className={`rounded-2xl border p-4 transition ${
                    selectedModule?.id ===
                    module.id
                      ? "border-violet-400/20 bg-violet-400/[0.03]"
                      : "border-white/[0.07] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {module.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {
                          module.current_score
                        }
                        % alignment
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${priorityClass(
                        module.priority,
                      )}`}
                    >
                      {
                        module.priority
                      }
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {module.practice_questions.map(
                      (
                        question,
                        index,
                      ) => (
                        <button
                          key={question}
                          type="button"
                          onClick={() =>
                            chooseQuestion(
                              module,
                              question,
                            )
                          }
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selectedQuestion ===
                            question
                              ? "border-violet-400/30 bg-violet-400/[0.06]"
                              : "border-white/[0.05] bg-white/[0.01] hover:border-white/[0.12]"
                          }`}
                        >
                          <div className="flex gap-3">
                            <span className="shrink-0 text-[11px] text-violet-400">
                              Q
                              {index +
                                1}
                            </span>

                            <span className="text-xs leading-5 text-zinc-400">
                              {
                                question
                              }
                            </span>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ),
            )}
          </aside>

          <section>
            {!selectedQuestion ? (
              <div className="card flex min-h-[520px] items-center justify-center p-8 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] text-2xl">
                    🎯
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold">
                    Choose a question
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Pick any question from
                    your personalized
                    preparation roadmap.
                    Then answer it using
                    text or your voice.
                  </p>
                </div>
              </div>
            ) : (
              <div className="card p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                    {
                      selectedModule?.title
                    }
                  </span>

                  <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-[10px] text-zinc-500">
                    {
                      selectedModule?.current_score
                    }
                    % alignment
                  </span>
                </div>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Interview question
                </p>

                <h2 className="mt-3 text-xl font-semibold leading-8 sm:text-2xl">
                  {selectedQuestion}
                </h2>

                <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-400">
                      Your answer
                    </p>

                    <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                      Text or voice
                    </span>
                  </div>

                  <textarea
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Explain your answer as if you're speaking to the interviewer..."
                    rows={10}
                    disabled={
                      evaluating ||
                      recording
                    }
                    className="input-field mt-4 resize-none px-4 py-4 text-sm leading-7 disabled:opacity-60"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={
                        evaluating ||
                        recording ||
                        !answer.trim()
                      }
                      onClick={
                        evaluateText
                      }
                      className="primary-button rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {evaluating
                        ? "Analyzing..."
                        : "Analyze text answer"}
                    </button>

                    {!recording ? (
                      <button
                        type="button"
                        disabled={
                          evaluating
                        }
                        onClick={
                          startRecording
                        }
                        className="rounded-xl border border-violet-400/20 bg-violet-400/[0.05] px-5 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-400/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        🎙 Answer with
                        voice
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          stopRecording
                        }
                        className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-5 py-3 text-sm font-semibold text-rose-300"
                      >
                        ● Stop recording{" "}
                        {
                          recordingSeconds
                        }
                        s
                      </button>
                    )}
                  </div>

                  {recording && (
                    <div className="mt-4 rounded-xl border border-rose-400/10 bg-rose-400/[0.03] px-4 py-3">
                      <p className="text-xs text-rose-300">
                        Recording your
                        answer...
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-600">
                        Speak naturally.
                        Stop when you
                        have finished
                        your answer.
                      </p>
                    </div>
                  )}

                  {evaluating && (
                    <div className="mt-4 rounded-xl border border-violet-400/10 bg-violet-400/[0.03] px-4 py-3">
                      <p className="text-xs text-violet-300">
                        InterviewPilot is
                        evaluating and
                        saving your
                        answer...
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-600">
                        Checking technical
                        accuracy,
                        completeness,
                        relevance, and
                        structure.
                      </p>
                    </div>
                  )}
                </div>

                {evaluation && (
                  <div className="mt-8 border-t border-white/[0.06] pt-8">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">
                          AI evaluation
                          saved
                        </p>

                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-5xl font-semibold">
                            {
                              evaluation.overall_score
                            }
                          </span>

                          <span className="mb-2 text-sm text-zinc-600">
                            /100
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                        ].map(
                          ([
                            label,
                            value,
                          ]) => (
                            <div
                              key={
                                label
                              }
                              className="min-w-[90px] rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center"
                            >
                              <p className="text-[9px] uppercase tracking-[0.08em] text-zinc-600">
                                {
                                  label
                                }
                              </p>

                              <p className="mt-1 text-lg font-semibold text-zinc-200">
                                {
                                  value
                                }
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {evaluation.transcript && (
                      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                          Transcript
                        </p>

                        <p className="mt-3 text-sm leading-7 text-zinc-400">
                          {
                            evaluation.transcript
                          }
                        </p>
                      </div>
                    )}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                          What you did
                          well
                        </p>

                        <div className="mt-3 space-y-2">
                          {evaluation.strengths.map(
                            (item) => (
                              <div
                                key={
                                  item
                                }
                                className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-3 text-xs leading-5 text-zinc-400"
                              >
                                {
                                  item
                                }
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                          Improve
                          this
                        </p>

                        <div className="mt-3 space-y-2">
                          {evaluation.improvements.map(
                            (item) => (
                              <div
                                key={
                                  item
                                }
                                className="rounded-lg border border-amber-400/10 bg-amber-400/[0.03] px-3 py-3 text-xs leading-5 text-zinc-400"
                              >
                                {
                                  item
                                }
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {evaluation.missing_concepts
                      .length >
                      0 && (
                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-300">
                          Missing
                          concepts
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {evaluation.missing_concepts.map(
                            (item) => (
                              <span
                                key={
                                  item
                                }
                                className="rounded-full border border-rose-400/10 bg-rose-400/[0.03] px-3 py-2 text-xs text-zinc-400"
                              >
                                {
                                  item
                                }
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 rounded-xl border border-violet-400/10 bg-violet-400/[0.03] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                        Stronger answer
                        direction
                      </p>

                      <p className="mt-3 text-sm leading-7 text-zinc-400">
                        {
                          evaluation.better_answer
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        startOverQuestion
                      }
                      className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
                    >
                      Try this
                      question again
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}