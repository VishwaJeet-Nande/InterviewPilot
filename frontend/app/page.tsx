import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Understand the role",
    description:
      "InterviewPilot analyzes the job description and identifies the technical, behavioral, and role-specific areas you are likely to face.",
  },
  {
    number: "02",
    title: "Understand you",
    description:
      "Your resume becomes part of the interview model. Every important claim can become a potential interview question.",
  },
  {
    number: "03",
    title: "Build your preparation",
    description:
      "Get a personalized preparation roadmap based on the difference between what the role needs and what you currently demonstrate.",
  },
  {
    number: "04",
    title: "Practice the real thing",
    description:
      "Take adaptive mock interviews where the next question changes based on the quality and depth of your answer.",
  },
];

const stats = [
  { value: "01", label: "Job description" },
  { value: "02", label: "Your profile" },
  { value: "03", label: "Interview DNA" },
  { value: "04", label: "Personalized practice" },
];

export default function Home() {
  return (
    <main className="app-shell min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            <span className="text-sm font-bold text-violet-300">IP</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Interview<span className="text-violet-400">Pilot</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
        </div>

        <Link
          href="/dashboard"
          className="secondary-button px-4 py-2 text-sm"
        >
          Open app
        </Link>
      </nav>

      <section className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 lg:px-8 lg:pb-36 lg:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[120px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="fade-in mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-4 py-2 text-xs font-medium text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            AI-powered interview preparation
          </div>

          <h1 className="fade-in text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
            Prepare for the
            <br />
            <span className="gradient-text">interview you actually have.</span>
          </h1>

          <p className="fade-in-delay mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            InterviewPilot studies the job description, understands your
            experience, predicts what you are likely to be asked, and trains
            you until you are ready.
          </p>

          <div className="fade-in-delay mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/interviews/new"
              className="primary-button w-full px-6 py-3.5 text-sm sm:w-auto"
            >
              Prepare for my interview
              <span>→</span>
            </Link>

            <Link
              href="/dashboard"
              className="secondary-button w-full px-6 py-3.5 text-sm sm:w-auto"
            >
              View dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs text-zinc-600">
            Built for real interviews. Not generic question banks.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="grid-background rounded-[28px] border border-white/[0.08] p-2">
            <div className="rounded-[22px] border border-white/[0.07] bg-[#0b0d10] p-5 shadow-2xl shadow-black/40 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-xs text-zinc-500">INTERVIEW DNA</p>
                  <h2 className="mt-1 text-lg font-semibold">
                    AI Engineer · Product Company
                  </h2>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-xs text-emerald-300">
                  78% Match
                </div>
              </div>

              <div className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Python", "91%", "strong"],
                  ["LLM / RAG", "88%", "strong"],
                  ["System Design", "51%", "weak"],
                  ["Cloud", "44%", "weak"],
                ].map(([name, score, status]) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{name}</span>
                      <span
                        className={
                          status === "strong"
                            ? "text-xs text-emerald-400"
                            : "text-xs text-rose-400"
                        }
                      >
                        {status === "strong" ? "Strong" : "Risk"}
                      </span>
                    </div>

                    <div className="mt-4 text-2xl font-semibold">
                      {score}
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full ${
                          status === "strong"
                            ? "w-[88%] bg-emerald-400"
                            : "w-[45%] bg-rose-400"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <p className="text-xs font-medium text-zinc-500">
                    LIKELY INTERVIEW FOCUS
                  </p>

                  <div className="mt-4 space-y-3">
                    {[
                      "RAG architecture and evaluation",
                      "Production FastAPI architecture",
                      "System design and scalability",
                      "PostgreSQL performance",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 text-sm text-zinc-300"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] text-violet-300">
                          0{index + 1}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-400/10 bg-rose-400/[0.025] p-5">
                  <p className="text-xs font-medium text-rose-300">
                    HIGH-RISK AREAS
                  </p>

                  <p className="mt-4 text-sm leading-6 text-zinc-400">
                    Your preparation should prioritize system design and cloud
                    architecture before the interview.
                  </p>

                  <div className="mt-5 text-xs text-zinc-600">
                    Personalized from your profile
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-y border-white/[0.06] bg-white/[0.012]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              One interview. One personalized preparation system.
            </h2>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="bg-[#0a0c0f] p-7 transition hover:bg-[#0e1014]"
              >
                <span className="text-xs font-medium text-violet-400">
                  {feature.number}
                </span>
                <h3 className="mt-10 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Built differently
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop studying everything.
              <br />
              Study what matters.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-500">
              InterviewPilot doesn't throw another hundred random questions at
              you. It finds the highest-value areas based on the exact role and
              your actual experience.
            </p>

            <Link
              href="/interviews/new"
              className="primary-button mt-8 px-5 py-3 text-sm"
            >
              Build my interview plan →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.value} className="card card-hover p-6">
                <div className="text-xs text-violet-400">{stat.value}</div>
                <div className="mt-10 text-lg font-medium text-white">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} InterviewPilot · An Inovexia product
          </span>
          <span>Built for people who want the offer.</span>
        </div>
      </footer>
    </main>
  );
}