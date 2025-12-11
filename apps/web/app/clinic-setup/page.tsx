"use client";

import { ClinicSetupForm } from "@/components/clinic-setup-form";
import { useSession } from "@/hooks/use-session";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClinicSetupPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  // Redirect if already setup complete
  useEffect(() => {
    if (!isLoading && user?.isClinicSetupComplete) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading while checking session or redirecting
  if (isLoading || user?.isClinicSetupComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configure sua clínica</h1>
          <p className="text-muted-foreground">
            Complete as informações da sua clínica para começar a usar o HealthSync
          </p>
        </div>
        <ClinicSetupForm />
      </div>
    </div>
  );
}
