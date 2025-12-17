"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { providerAvailabilityKeys } from "./use-provider-availability";

interface CreateAppointmentInput {
  patientId: string;
  providerId: string;
  appointmentStart: string; // ISO datetime
  appointmentEnd: string;
  notes?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  providerName: string;
  appointmentStart: string;
  appointmentEnd: string;
  status: string;
}

interface AppointmentResponse {
  appointment: Appointment;
}

/**
 * Hook to create a new appointment.
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentInput) => {
      const response = await api<AppointmentResponse>("/appointments", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.appointment;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: providerAvailabilityKeys.all });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          toast.error("Horario indisponivel. Por favor, escolha outro.");
        } else {
          toast.error(error.message || "Erro ao agendar consulta");
        }
      } else {
        toast.error("Erro ao agendar consulta");
      }
    },
  });
}
