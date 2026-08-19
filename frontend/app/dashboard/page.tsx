import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (!claims?.sub) {
    redirect("/auth/login");
  }

  const userId = claims.sub;

  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Candidate";

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, target_role, experience_level")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
    });
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select(
      "id, job_title, company_name, status, created_at, job_description",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const interviewCount = interviews?.length ?? 0;

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

          <div className="flex items-center gap-5">
            <SignOutButton />

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-xs font-semibold text-violet-300">
              {fullName
                .split(" ")
                .slice(0, 2)
                .map((part: string) => part[0])
                .join("")
                .toUpperCase()}
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
              Welcome, {fullName.split(" ")[0]}.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Your interview preparation cockpit. Create an interview to start
              building your personalized preparation system.
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
            [String(interviewCount), "Interviews", "created"],
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

              <span className="text-xs text-zinc-600">
                {interviewCount} total
              </span>
            </div>

            <div className="p-6">
              {interviews && interviews.length > 0 ? (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {interview.job_title}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {interview.company_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1 text-[10px] text-violet-300">
                            {interview.status}
                          </span>

                          <span className="text-[10px] text-zinc-700">
                            {new Date(
                              interview.created_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    +
                  </div>

                  <h3 className="mt-4 text-sm font-medium">
                    No interviews yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                    Add your first job description and resume to generate your
                    personalized Interview DNA.
                  </p>

                  <Link
                    href="/interviews/new"
                    className="primary-button mt-5 px-4 py-2.5 text-xs"
                  >
                    Create first interview →
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <h2 className="font-semibold">Profile</h2>
              <p className="mt-1 text-xs text-zinc-600">
                Your current candidate identity
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                  Name
                </p>
                <p className="mt-2 text-sm text-zinc-300">{fullName}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                  Email
                </p>
                <p className="mt-2 break-all text-sm text-zinc-300">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-700">
                  Target role
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {profile?.target_role || "Will be inferred from interviews"}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Interview DNA",
              description:
                "Map the exact job requirements against your experience.",
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