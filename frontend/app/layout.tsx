import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewPilot — Prepare for Your Interview",
  description:
    "AI-powered interview preparation that analyzes your job description, resume, and experience to prepare you for the interview that actually matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}