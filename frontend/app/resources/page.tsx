import Link from "next/link";

export const metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  const resources = [
    {
      number: "01",
      title: "Interview DNA",
      description:
        "Understand how Curion converts your resume and target role into a structured preparation model.",
      href: "/interviews",
      action: "View interviews",
    },
    {
      number: "02",
      title: "Deliberate Practice",
      description:
        "Practice answers against the technical and behavioral areas identified for your target role.",
      href: "/preparation",
      action: "Start preparing",
    },
    {
      number: "03",
      title: "AI Mock Interviews",
      description:
        "Use the mock interview workflow to test how your preparation performs under realistic questioning.",
      href: "/interviews",
      action: "Open workspace",
    },
    {
      number: "04",
      title: "Readiness",
      description:
        "Track your demonstrated preparation through Interview DNA, practice performance, and mock results.",
      href: "/interviews",
      action: "View readiness",
    },
  ];

  return (
    <main className="app-shell min-h-full">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Resources
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Understand how Curion works.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Curion is built around a connected preparation loop rather than a
            collection of disconnected interview tools.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <Link
              key={resource.number}
              href={resource.href}
              className="card group p-7 transition hover:-translate-y-0.5 hover:border-violet-400/15 hover:bg-violet-400/[0.02]"
            >
              <span className="text-xs font-semibold text-violet-400">
                {resource.number}
              </span>

              <h2 className="mt-4 text-xl font-semibold">
                {resource.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {resource.description}
              </p>

              <span className="mt-6 inline-flex text-xs font-semibold text-violet-300 transition group-hover:text-violet-200">
                {resource.action} →
              </span>
            </Link>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-white/[0.06] bg-white/[0.015] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
            The Curion loop
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {[
              "Resume",
              "Job Description",
              "Interview DNA",
              "Preparation",
              "Practice",
              "Mock",
              "Readiness",
            ].map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                <span className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                  {item}
                </span>

                {index < 6 && (
                  <span className="text-zinc-700">→</span>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
