import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=Missing+confirmation+code", request.url),
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Supabase confirmation error:", error.message);

    return NextResponse.redirect(
      new URL(
        "/auth/login?error=Confirmation+failed.+Please+request+a+new+confirmation+email.",
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}