"use client";

import Link from "next/link";

const features = [
  {
    number: "01",
    title: "UNDERSTAND",
    subtitle: "Decode the opportunity",
    description:
      "Curion reads the role, company context, and your experience to understand what the interview is actually testing.",
  },
  {
    number: "02",
    title: "DISCOVER",
    subtitle: "Build your Interview DNA",
    description:
      "See where your experience aligns, where the risks are, and which technical areas deserve your attention.",
  },
  {
    number: "03",
    title: "PREPARE",
    subtitle: "Train where it matters",
    description:
      "Follow a preparation system built around your actual gaps instead of spending hours on generic interview content.",
  },
  {
    number: "04",
    title: "PROVE",
    subtitle: "Practice under pressure",
    description:
      "Take realistic AI mock interviews and receive structured feedback on the way you communicate and reason.",
  },
];

const workflow = [
  "Your role",
  "Your experience",
  "Your Interview DNA",
  "Your preparation",
];

const dnaAreas = [
  {
    label: "Python",
    score: 91,
    status: "strong",
  },
  {
    label: "LLM / RAG",
    score: 88,
    status: "strong",
  },
  {
    label: "System Design",
    score: 51,
    status: "risk",
  },
  {
    label: "Cloud",
    score: 44,
    status: "risk",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.08);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-120%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(420%);
            opacity: 0;
          }
        }

        @keyframes reveal {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes widthGrow {
          from {
            width: 0%;
          }
          to {
            width: var(--target-width);
          }
        }

        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(125px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(125px) rotate(-360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        @keyframes gridMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(32px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .animate-reveal {
          animation: reveal 0.8s ease-out both;
        }

        .animate-shimmer {
          background-size: 1000px 100%;
          animation: shimmer 5s linear infinite;
        }

        .hero-grid {
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 32px 32px;
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            black 65%,
            transparent 100%
          );
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[140px]" />
        <div className="absolute left-[-300px] top-[30%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.035] blur-[140px]" />
        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-indigo-600/[0.035] blur-[150px]" />
      </div>

      {/* Grid */}
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[850px] opacity-70" />

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#050507]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center">
            <div className="relative h-10 w-[170px]">
              <img
                src="/branding/curion-ai-dark.png"
                alt="Curion AI"
                className="h-full w-full object-contain object-left"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              How it works
            </a>
            <a
              href="#intelligence"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Intelligence
            </a>
            <a
              href="#about"
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="rounded-xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/30 hover:bg-violet-500/[0.14]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-10 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="animate-reveal">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.06] px-3.5 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Curion AI · Career Intelligence
                </span>
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Prepare with{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
                  intelligence.
                </span>
                <br />
                Perform with confidence.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Curion transforms your resume and target role into a
                personalized interview intelligence system — showing you what
                matters, where you stand, and what to prepare next.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Build my preparation system
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
                >
                  See how Curion works
                </a>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-600">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                  Resume-aware
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
                  Role-specific
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400/80" />
                  AI-powered
                </span>
              </div>
            </div>

            {/* Hero product preview */}
            <div className="relative mx-auto w-full max-w-[580px] animate-float">
              <div className="absolute -inset-10 rounded-[40px] bg-violet-500/[0.07] blur-[70px]" />

              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#0b0b0f]/90 shadow-2xl shadow-black/50">
                <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    </div>
                    <span className="ml-3 text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                      Interview Intelligence
                    </span>
                  </div>

                  <span className="rounded-md border border-emerald-400/10 bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-medium uppercase tracking-wider text-emerald-300/80">
                    Analysis ready
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300/70">
                        Interview DNA
                      </p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                        AI Engineer
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600">
                        NVIDIA · Personalized analysis
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.06]">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-violet-200">
                          78
                        </div>
                        <div className="text-[7px] uppercase tracking-wider text-zinc-600">
                          match
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3">
                    {dnaAreas.map((area, index) => (
                      <div key={area.label}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">
                            {area.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[8px] uppercase tracking-wider ${
                                area.status === "strong"
                                  ? "text-emerald-400/70"
                                  : "text-amber-400/70"
                              }`}
                            >
                              {area.status}
                            </span>
                            <span className="w-7 text-right text-[10px] font-medium text-zinc-300">
                              {area.score}
                            </span>
                          </div>
                        </div>

                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className={`h-full rounded-full ${
                              area.status === "strong"
                                ? "bg-emerald-400/70"
                                : "bg-amber-400/60"
                            }`}
                            style={{
                              width: `${area.score}%`,
                              animation: `widthGrow 1.2s ease-out ${
                                0.2 + index * 0.15
                              }s both`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
                        Priority gap
                      </p>
                      <p className="mt-2 text-xs font-medium text-zinc-300">
                        System Design
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-zinc-600">
                        Needs focused preparation
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
                      <p className="text-[8px] uppercase tracking-[0.16em] text-zinc-600">
                        Next action
                      </p>
                      <p className="mt-2 text-xs font-medium text-zinc-300">
                        Practice
                      </p>
                      <p className="mt-1 text-[9px] leading-4 text-zinc-600">
                        Architecture scenarios
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.012] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl md:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`group relative px-0 py-9 md:px-7 ${
                index !== 0 ? "border-t border-white/[0.06] md:border-l md:border-t-0" : ""
              }`}
            >
              <span className="text-[9px] font-semibold tracking-[0.2em] text-violet-400/60">
                {feature.number}
              </span>

              <h3 className="mt-4 text-xs font-semibold tracking-[0.16em] text-zinc-300 transition group-hover:text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm font-medium text-white/90">
                {feature.subtitle}
              </p>

              <p className="mt-3 text-xs leading-6 text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section id="about" className="relative z-10 px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400/70">
              The idea behind Curion
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl">
              Curiosity is where progress begins.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-500">
              Curion is inspired by the scientific spirit of Marie Curie:
              question deeply, understand evidence, and keep moving toward a
              better answer.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-500">
              The product applies that mindset to career preparation. Instead
              of giving you another generic list of interview questions,
              Curion builds an intelligence layer around your specific
              opportunity.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px w-10 bg-violet-400/40" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Curiosity → Intelligence → Progress
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-[80px]" />

            <div className="relative mx-auto max-w-lg">
              <div className="grid grid-cols-2 gap-3">
                {workflow.map((item, index) => (
                  <div
                    key={item}
                    className={`relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018] p-5 ${
                      index === 0 ? "translate-y-4" : ""
                    } ${index === 3 ? "-translate-y-4" : ""}`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400/60">
                      0{index + 1}
                    </span>

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                      {item}
                    </p>

                    {index < workflow.length - 1 && (
                      <div className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-white/[0.08] bg-[#08080b] sm:block" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-violet-400/10 bg-violet-500/[0.035] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-500/[0.06]">
                    <span className="text-xs text-violet-300">✦</span>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-violet-300/70">
                      Curion intelligence layer
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Turning context into preparation decisions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 border-y border-white/[0.06] bg-white/[0.012] px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400/70">
              How Curion works
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl">
              From documents to a preparation system.
            </h2>

            <p className="mt-6 text-base leading-8 text-zinc-500">
              Curion connects the context that normally lives in separate
              places and turns it into one structured preparation workflow.
            </p>
          </div>

          <div className="mt-16 grid gap-4 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Add your opportunity",
                text: "Enter the target role, company, and job description.",
              },
              {
                number: "02",
                title: "Add your experience",
                text: "Upload your resume so Curion can understand your actual background.",
              },
              {
                number: "03",
                title: "Generate your DNA",
                text: "Curion maps strengths, risks, technical areas, and likely interview focus.",
              },
              {
                number: "04",
                title: "Train and measure",
                text: "Practice targeted questions, complete mock interviews, and track readiness.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#08080b] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/15"
              >
                <span className="text-[9px] font-semibold tracking-[0.2em] text-violet-400/60">
                  {item.number}
                </span>

                <h3 className="mt-7 text-base font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-600">
                  {item.text}
                </p>

                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/[0.04] blur-2xl transition group-hover:bg-violet-500/[0.08]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence */}
      <section
        id="intelligence"
        className="relative z-10 px-5 py-28 sm:px-8 lg:px-10 lg:py-36"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400/70">
              Intelligence, not information
            </p>

            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl">
              Know where to spend your preparation time.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-500">
              A resume tells your story. A job description tells you what the
              company wants. Curion connects the two and identifies the areas
              that deserve attention.
            </p>

            <div className="mt-10 space-y-5">
              {[
                "Understand your match against the role.",
                "Identify high-risk technical and behavioral areas.",
                "Practice questions generated around your actual gaps.",
                "Measure progress through mock interviews and readiness.",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-400/15 bg-violet-500/[0.05] text-[9px] text-violet-300">
                    0{index + 1}
                  </div>

                  <p className="text-sm leading-6 text-zinc-400">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-violet-500/[0.04] blur-[70px]" />

            <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#08080b]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                    Readiness intelligence
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    AI Engineer · NVIDIA
                  </p>
                </div>

                <span className="rounded-lg border border-violet-400/10 bg-violet-500/[0.05] px-2.5 py-1.5 text-[8px] uppercase tracking-wider text-violet-300/70">
                  Live
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                      Readiness score
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-semibold tracking-[-0.04em] text-white">
                        76
                      </span>
                      <span className="text-xs text-zinc-600">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                      Status
                    </p>
                    <p className="mt-1 text-xs font-medium text-amber-300/80">
                      Nearly Ready
                    </p>
                  </div>
                </div>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300"
                    style={{
                      width: "76%",
                      animation: "widthGrow 1.4s ease-out both",
                    }}
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                      Interview DNA
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">62</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                      Mock
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">92</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                    <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                      Practice
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">51</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-300/60">
                    Priority gap
                  </p>
                  <p className="mt-2 text-sm font-medium text-zinc-300">
                    Cloud / Azure ecosystem
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-zinc-600">
                    Focus preparation on Azure AI services, cloud architecture,
                    and deployment patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 overflow-hidden px-5 py-28 sm:px-8 lg:px-10 lg:py-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.06] blur-[120px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto h-16 w-16 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-violet-950/20">
            <img
              src="/branding/curion-mark-dark.png"
              alt="Curion AI"
              className="h-full w-full object-cover"
            />
          </div>

          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-400/70">
            Your next interview starts here
          </p>

          <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-6xl">
            Stop preparing randomly.
            <br />
            <span className="text-zinc-500">Prepare intelligently.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-500">
            Give Curion your role and experience. Build your Interview DNA,
            train your weak areas, and walk into the interview knowing what to
            expect.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Build my preparation system
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.025] px-7 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-white/[0.15] hover:bg-white/[0.05] hover:text-white"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
            <div>
              <Link href="/" className="inline-flex items-center">
                <div className="relative h-9 w-[150px]">
                  <img
                    src="/branding/curion-ai-dark.png"
                    alt="Curion AI"
                    className="h-full w-full object-contain object-left"
                  />
                </div>
              </Link>

              <p className="mt-4 max-w-xs text-xs leading-6 text-zinc-600">
                Career intelligence for people who want to prepare with
                intention.
              </p>

              <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-zinc-700">
                Curiosity · Intelligence · Progress
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-16 gap-y-8 sm:grid-cols-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Product
                </p>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/signup"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Get started
                  </Link>
                  <a
                    href="#how-it-works"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    How it works
                  </a>
                  <a
                    href="#intelligence"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Intelligence
                  </a>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Company
                </p>

                <div className="mt-4 space-y-3">
                  <a
                    href="#about"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    About
                  </a>
                  <a
                    href="mailto:hello@curion.ai"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Contact
                  </a>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Account
                </p>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/login"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-xs text-zinc-600 transition hover:text-zinc-300"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[0.05] pt-6 sm:flex-row sm:items-center">
            <p className="text-[10px] text-zinc-700">
              © {new Date().getFullYear()} Curion AI. All rights reserved.
            </p>

            <div className="flex items-center gap-5">
              <span className="text-[10px] text-zinc-700">
                Built for better preparation.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}