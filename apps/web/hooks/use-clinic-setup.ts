"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
    closed: boolean;
  };
}

interface ClinicSetupData {
  name: string;
  contactPhone: string;
  contactEmail?: string;
  businessHours: BusinessHours;
  timezone: string;
  averageAppointmentValue?: number;
}

export function useClinicSetup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ClinicSetupData) =>
      api("/clinics/setup", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/dashboard");
    },
  });
}
