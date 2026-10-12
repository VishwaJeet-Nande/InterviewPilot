"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import CurionHeader from "@/components/curion-header";
import CurionFooter from "@/components/curion-footer";
import { createClient } from "@/lib/supabase/client";

export default function CurionAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/auth");

  useEffect(() => {
    if (isPublicRoute) return;

    let mounted = true;

    async function loadUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) return;

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Candidate";

      setFullName(name);
      setEmail(user.email ?? null);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="curion-app-shell flex min-h-screen flex-col">
      <CurionHeader
        fullName={fullName}
        email={email}
      />

      <div className="curion-route-content flex-1">
        {children}
      </div>

      <CurionFooter />
    </div>
  );
}
