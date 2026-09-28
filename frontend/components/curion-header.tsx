"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SignOutButton from "@/components/sign-out-button";

type CurionHeaderProps = {
  fullName?: string | null;
  email?: string | null;
};

export default function CurionHeader({
  fullName,
  email,
}: CurionHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    fullName?.trim() || "Curion User";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "C";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMenus() {
    setMenuOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          onClick={closeMenus}
          className="group flex items-center"
        >
          <div className="relative h-10 w-[150px] sm:w-[165px]">
            <img
              src="/branding/curion-ai-dark.png"
              alt="Curion AI"
              className="h-full w-full object-contain object-left"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/interviews"
            className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Interviews
          </Link>

          <Link
            href="/preparation"
            className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Preparation
          </Link>

          <Link
            href="/resources"
            className="rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Resources
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/interviews/new"
            className="hidden rounded-xl border border-violet-400/15 bg-violet-500/[0.08] px-3.5 py-2.5 text-xs font-semibold text-violet-300 transition hover:border-violet-400/25 hover:bg-violet-500/[0.13] sm:inline-flex"
          >
            + New interview
          </Link>

          <button
            type="button"
            aria-label="Notifications"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-500 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white sm:flex"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-[17px] w-[17px]"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.4-1.8A2 2 0 0 1 18.2 14v-3a6.2 6.2 0 0 0-4.7-6V4a1.5 1.5 0 0 0-3 0v1A6.2 6.2 0 0 0 5.8 11v3c0 .4-.1.8-.4 1.2L4 17h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9"
                />
              </svg>

              <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            </span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-label="Open account menu"
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 transition hover:border-violet-400/20 hover:bg-white/[0.04]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-300">
                {initials}
              </div>

              <span className="hidden max-w-28 truncate px-1 text-xs font-medium text-zinc-300 lg:block">
                {displayName}
              </span>

              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`hidden h-3 w-3 text-zinc-600 transition-transform lg:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[52px] w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101014]/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                <div className="border-b border-white/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xs font-bold text-violet-300">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {displayName}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-zinc-600">
                        {email || "Curion account"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>
                      <span className="block font-medium text-zinc-300">
                        Profile
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-700">
                        Manage your candidate profile
                      </span>
                    </span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>
                      <span className="block font-medium text-zinc-300">
                        Settings
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-700">
                        Preferences and account controls
                      </span>
                    </span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/settings?section=appearance"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>
                      <span className="block font-medium text-zinc-300">
                        Appearance
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-700">
                        Theme and visual preferences
                      </span>
                    </span>
                    <span>→</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <span>
                      <span className="block font-medium text-zinc-300">
                        About Curion
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-700">
                        The idea behind Curion
                      </span>
                    </span>
                    <span>→</span>
                  </Link>

                  <div className="my-2 border-t border-white/[0.05]" />

                  <div className="px-1">
                    <SignOutButton />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((value) => !value);
              setMenuOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white md:hidden"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#09090d]/95 px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur-2xl md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1">
            {[
              ["/dashboard", "Dashboard"],
              ["/interviews", "My Interviews"],
              ["/preparation", "Preparation"],
              ["/resources", "Resources"],
              ["/account", "Profile"],
              ["/settings", "Settings"],
              ["/about", "About Curion"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenus}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
              >
                <span>{label}</span>
                <span className="text-zinc-700">→</span>
              </Link>
            ))}

            <Link
              href="/interviews/new"
              onClick={closeMenus}
              className="mt-3 block rounded-xl bg-violet-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-400"
            >
              + Create interview
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}