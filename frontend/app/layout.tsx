import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Curion — AI Career Intelligence",
    template: "%s — Curion",
  },
  description:
    "Curion is an AI-powered career preparation system that helps you understand your role, discover your gaps, practice intelligently, and become interview-ready.",
  applicationName: "Curion",
  keywords: [
    "Curion",
    "AI career preparation",
    "AI interview preparation",
    "mock interviews",
    "interview readiness",
    "career intelligence",
    "Interview DNA",
  ],
  authors: [{ name: "Curion" }],
  creator: "Curion",
  publisher: "Curion",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}