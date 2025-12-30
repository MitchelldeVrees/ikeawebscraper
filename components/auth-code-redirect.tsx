"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthCodeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;
    const next = searchParams.get("next") ?? "/welcome";
    const encodedNext = encodeURIComponent(next);
    router.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodedNext}`);
  }, [router, searchParams]);

  return null;
}
