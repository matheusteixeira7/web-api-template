"use client";

import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSession();
  const router = useRouter();

  // Redirect to setup if clinic not configured
  useEffect(() => {
    if (!isLoading && user && !user.isClinicSetupComplete) {
      router.push("/clinic-setup");
    }
  }, [user, isLoading, router]);

  // If user needs setup, don't render children (will redirect)
  if (user && !user.isClinicSetupComplete) {
    return null;
  }

  // Render children (the app layout)
  return <>{children}</>;
}
