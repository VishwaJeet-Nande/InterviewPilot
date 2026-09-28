import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next =
    request.nextUrl.searchParams.get("next") ||
    "/dashboard";

  const safeNext =
    next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?error=Authentication+code+missing",
        request.url,
      ),
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Supabase auth callback error:",
      error.message,
    );

    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(
          "Authentication failed. Please try again.",
        )}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(safeNext, request.url),
  );
}