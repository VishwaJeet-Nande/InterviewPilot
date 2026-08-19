"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function NewInterviewPage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue =
    jobTitle.trim().length > 0 &&
    company.trim().length > 0 &&
    jobDescription.trim().length >= 50 &&
    resumeFile !== null;

  function handleFile(file: File | undefined) {
    if (!file) return;

    setError("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "doc", "docx"].includes(extension || "")) {
      setError("Please upload a PDF, DOC, or DOCX resume.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Resume must be smaller than 5 MB.");
      return;
    }

    setResumeFile(file);
  }

  async function handleSubmit() {
    if (!canContinue || !resumeFile) return;

    setLoading(true);
    setError("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/auth/login?next=/interviews/new");
      return;
    }

    const extension =
      resumeFile.name.split(".").pop()?.toLowerCase() || "pdf";

    const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: resumeFile.type || "application/octet-stream",
      });

    if (uploadError) {
      setError(`Resume upload failed: ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: resumeFile.name,
        file_path: filePath,
        file_type: resumeFile.type,
        file_size: resumeFile.size,
      })
      .select("id")
      .single();

    if (resumeError || !resume) {
      await supabase.storage.from("resumes").remove([filePath]);

      setError(
        resumeError?.message || "Could not save resume information.",
      );
      setLoading(false);
      return;
    }

    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .insert({
        user_id: user.id,
        job_title: jobTitle.trim(),
        company_name: company.trim(),
        job_description: jobDescription.trim(),
        resume_id: resume.id,
        status: "created",
      })
      .select("id")
      .single();

    if (interviewError || !interview) {
      await supabase.from("resumes").delete().eq("id", resume.id);
      await supabase.storage.from("resumes").remove([filePath]);

      setError(
        interviewError?.message || "Could not create your interview.",
      );
      setLoading(false);
      return;
    }

    router.replace(`/interviews/${interview.id}`);
    router.refresh();
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
            Give InterviewPilot the role and your actual experience. Both will
            become part of your personalized interview model.
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
                  Paste the complete job description.
                </p>

                <textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(event.target.value)
                  }
                  placeholder="Paste the job description here..."
                  rows={12}
                  className="input-field mt-3 resize-none px-4 py-3 text-sm leading-6"
                />

                <div className="mt-2 flex justify-between text-[11px]">
                  <span
                    className={
                      jobDescription.length >= 50
                        ? "text-emerald-500"
                        : "text-zinc-700"
                    }
                  >
                    {jobDescription.length >= 50
                      ? "Job description looks good."
                      : "Add at least 50 characters."}
                  </span>

                  <span className="text-zinc-700">
                    {jobDescription.length} characters
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-zinc-200">
                  Your resume
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  PDF, DOC, or DOCX · Maximum 5 MB
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

                  {resumeFile ? (
                    <>
                      <p className="mt-4 max-w-full truncate text-sm font-medium text-white">
                        {resumeFile.name}
                      </p>

                      <p className="mt-1 text-xs text-emerald-400">
                        Resume ready ·{" "}
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-sm font-medium text-zinc-300">
                        Drop your resume here
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        or click to browse
                      </p>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs leading-5 text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={!canContinue || loading}
                onClick={handleSubmit}
                className={`w-full rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                  canContinue && !loading
                    ? "primary-button"
                    : "cursor-not-allowed bg-white/[0.06] text-zinc-600"
                }`}
              >
                {loading ? "Creating your interview..." : "Create interview →"}
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
                    "We build your focused preparation roadmap.",
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
                PRIVATE BY DEFAULT
              </p>

              <p className="mt-3 text-xs leading-5 text-zinc-600">
                Your resume is stored in a private bucket and protected by
                Supabase Row Level Security.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}