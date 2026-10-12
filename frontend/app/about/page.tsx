import Link from "next/link";

export const metadata = {
  title: "About Curion",
};

export default function AboutPage() {
  return (
    <main className="app-shell min-h-full">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-500/[0.08] blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              About Curion
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Career preparation should become more intelligent as you use it.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-500">
              Curion is an AI-powered career intelligence system designed to
              turn a resume and job description into a progressively deeper
              understanding of interview readiness.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/interviews/new"
                className="primary-button rounded-xl px-5 py-3 text-sm font-semibold"
              >
                Create an interview
              </Link>

              <Link
                href="/interviews"
                className="secondary-button rounded-xl px-5 py-3 text-sm font-medium"
              >
                View interviews
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Curiosity",
              description:
                "Ask the right questions about the role instead of preparing from a generic checklist.",
            },
            {
              number: "02",
              title: "Intelligence",
              description:
                "Turn your resume, job description, practice activity, and interview performance into useful signals.",
            },
            {
              number: "03",
              title: "Progress",
              description:
                "Use deliberate practice and measurable readiness signals to understand where preparation should go next.",
            },
          ].map((item) => (
            <div key={item.number} className="card p-7">
              <span className="text-xs font-semibold text-violet-400">
                {item.number}
              </span>

              <h2 className="mt-4 text-xl font-semibold">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <section className="card mt-6 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            How it works
          </p>

          <div className="mt-7 space-y-4">
            {[
              ["Resume + Job Description", "Give Curion the real context."],
              ["Interview DNA", "Understand role alignment and risk areas."],
              ["Preparation", "Turn gaps into focused preparation."],
              ["Practice", "Demonstrate your understanding through answers."],
              ["AI Mock Interview", "Test yourself under interview conditions."],
              ["Readiness", "See how your demonstrated performance is changing."],
            ].map(([title, description], index) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/[0.08] text-[10px] font-semibold text-violet-300">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-violet-400/10 bg-violet-400/[0.025] p-8 text-center">
          <p className="text-sm font-semibold text-violet-300">
            Curiosity. Intelligence. Progress.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-zinc-600">
            The name Curion is inspired by the scientific spirit associated
            with Marie Curie. Curion is an independent product and is not
            officially connected with, endorsed by, or affiliated with Marie
            Curie or her estate.
          </p>
        </section>
      </div>
    </main>
  );
}
