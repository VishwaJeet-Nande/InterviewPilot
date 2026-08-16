import Link from "next/link";

const upcoming = [
  {
    company: "Your first interview",
    role: "Create an interview to get started",
    date: "Not scheduled",
    status: "Start",
  },
];

const focusAreas = [
  {
    name: "System Design",
    score: 42,
    level: "Needs work",
  },
  {
    name: "Cloud Architecture",
    score: 51,
    level: "Needs work",
  },
  {
    name: "PostgreSQL",
    score: 67,
    level: "Developing",
  },
];

export default function DashboardPage() {
  return (
    <main className="app-shell min-h-screen">
      <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <span className="text-xs font-bold text-violet-300">IP</span>
            </div>
            <span className="font-semibold tracking-tight">
              Interview<span className="text-violet-400">Pilot</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-zinc-300">Welcome back</p>
              <p className="text-[11px] text-zinc-600">Candidate</p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-xs font-semibold text-violet-300">
              VJ
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your interview cockpit.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Prepare for a specific opportunity, practice under pressure, and
              turn your weak areas into strengths.
            </p>
          </div>

          <Link
            href="/interviews/new"
            className="primary-button px-5 py-3 text-sm"
          >
            + New interview
          </Link>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["0", "Interviews", "completed"],
            ["—", "Readiness", "not assessed"],
            ["0", "Practice", "sessions"],
            ["—", "Top weakness", "not discovered"],
          ].map(([value, label, caption]) => (
            <div key={label} className="card p-5">
              <p className="text-xs text-zinc-600">{caption}</p>
              <p className="mt-4 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-zinc-400">{label}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <h2 className="font-semibold">Your interviews</h2>
                <p className="mt-1 text-xs text-zinc-600">
                  Opportunities you're preparing for
                </p>
              </div>

              <span className="text-xs text-zinc-600">0 active</span>
            </div>

            <div className="p-6">
              {upcoming.map((item) => (
                <div
                  key={item.company}
                  className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.company}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {item.role}
                      </p>
                    </div>

                    <Link
                      href="/interviews/new"
                      className="secondary-button px-4 py-2.5 text-xs"
                    >
                      {item.status} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <h2 className="font-semibold">Focus areas</h2>
              <p className="mt-1 text-xs text-zinc-600">
                Discovered through your interviews
              </p>
            </div>

            <div className="space-y-5 p-6">
              {focusAreas.map((area) => (
                <div key={area.name}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{area.name}</span>
                    <span className="text-xs text-zinc-600">
                      {area.score}%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-zinc-600">
                    {area.level}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Interview DNA",
              description:
                "Understand what your target role is likely to test.",
            },
            {
              title: "Resume Defendability",
              description:
                "Find claims in your resume an interviewer may challenge.",
            },
            {
              title: "Adaptive Practice",
              description:
                "Practice with questions that change based on your answers.",
            },
          ].map((item) => (
            <div key={item.title} className="card card-hover p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-sm text-violet-300">
                ✦
              </div>
              <h3 className="mt-5 text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-zinc-600">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}