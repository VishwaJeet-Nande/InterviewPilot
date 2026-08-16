"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewInterviewPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [dragging, setDragging] = useState(false);

  const canContinue =
    jobTitle.trim().length > 0 &&
    company.trim().length > 0 &&
    jobDescription.trim().length > 50 &&
    resumeName.length > 0;

  function handleFile(file: File | undefined) {
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (allowed.includes(file.type) || file.name.toLowerCase().endsWith(".pdf")) {
      setResumeName(file.name);
    }
  }

  function handleSubmit() {
    if (!canContinue) return;

    alert(
      "Interview creation is ready. The AI analysis backend will be connected in the next milestone.",
    );
  }

  return (
    <main className="app-shell min-h-screen">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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
            Cancel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="text-violet-400">01</span>
            <span>Interview setup</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tell us about the interview.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Give InterviewPilot the role and your actual experience. We'll use
            both to build a preparation plan around the interview you're
            targeting.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.42fr]">
          <section className="card p-6 sm:p-8">
            <div className="space-y-7">
              <div>
                <label
                  htmlFor="job-title"
                  className="text-sm font-medium text-zinc-200"
                >
                  Target role
                </label>

                <p className="mt-1 text-xs text-zinc-600">
                  The position you're interviewing for.
                </p>

                <input
                  id="job-title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="e.g. AI Engineer"
                  className="input-field mt-3 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="text-sm font-medium text-zinc-200"
                >
                  Company
                </label>

                <p className="mt-1 text-xs text-zinc-600">
                  The company you're interviewing with.
                </p>

                <input
                  id="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. NVIDIA"
                  className="input-field mt-3 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="job-description"
                  className="text-sm font-medium text-zinc-200"
                >
                  Job description
                </label>

                <p className="mt-1 text-xs text-zinc-600">
                  Paste the complete job description. More context means a
                  better interview model.
                </p>

                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the job description here..."
                  rows={12}
                  className="input-field mt-3 resize-none px-4 py-3 text-sm leading-6"
                />

                <div className="mt-2 flex justify-between text-[11px] text-zinc-700">
                  <span>
                    {jobDescription.length < 50
                      ? "Add more detail for accurate analysis."
                      : "Job description looks good."}
                  </span>

                  <span>{jobDescription.length} characters</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-zinc-200">
                  Your resume
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  InterviewPilot uses your actual experience to generate
                  realistic follow-up questions.
                </p>

                <label
                  htmlFor="resume"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    handleFile(event.dataTransfer.files[0]);
                  }}
                  className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
                    dragging
                      ? "border-violet-400/60 bg-violet-400/[0.06]"
                      : "border-white/[0.1] bg-white/[0.015] hover:border-white/[0.18] hover:bg-white/[0.025]"
                  }`}
                >
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(event) =>
                      handleFile(event.target.files?.[0])
                    }
                  />

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-lg">
                    ↑
                  </div>

                  {resumeName ? (
                    <>
                      <p className="mt-4 text-sm font-medium text-white">
                        {resumeName}
                      </p>
                      <p className="mt-1 text-xs text-emerald-400">
                        Resume selected
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-sm font-medium text-zinc-300">
                        Drop your resume here
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        or click to browse · PDF, DOC, DOCX
                      </p>
                    </>
                  )}
                </label>
              </div>

              <button
                type="button"
                disabled={!canContinue}
                onClick={handleSubmit}
                className={`w-full rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                  canContinue
                    ? "primary-button"
                    : "cursor-not-allowed bg-white/[0.06] text-zinc-600"
                }`}
              >
                Analyze my interview →
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                What happens next
              </p>

              <div className="mt-6 space-y-5">
                {[
                  [
                    "01",
                    "Interview DNA",
                    "We map the role against your experience.",
                  ],
                  [
                    "02",
                    "Risk detection",
                    "We identify likely weak areas and resume claims.",
                  ],
                  [
                    "03",
                    "Preparation",
                    "You receive a focused preparation roadmap.",
                  ],
                  [
                    "04",
                    "Mock interview",
                    "You practice with an adaptive AI interviewer.",
                  ],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-3">
                    <span className="mt-0.5 text-[11px] text-violet-400">
                      {number}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-6">
              <p className="text-xs font-medium text-emerald-300">
                YOUR DATA
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-600">
                Your resume and interview information will be used to
                personalize your preparation experience.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}