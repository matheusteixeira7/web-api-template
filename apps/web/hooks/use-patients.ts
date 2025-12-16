"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type {
  Patient,
  PatientsResponse,
  PatientResponse,
  CreatePatientInput,
  UpdatePatientInput,
  PatientsQueryParams,
} from "@/lib/validations/patient";
import { toast } from "sonner";

/**
 * Query key factory for patients.
 */
export const patientKeys = {
  all: ["patients"] as const,
  list: (params?: PatientsQueryParams) =>
    [...patientKeys.all, "list", params] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
};

/**
 * Build query string from params object.
 */
function buildQueryString(params?: PatientsQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortDir) searchParams.set("sortDir", params.sortDir);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.perPage) searchParams.set("perPage", params.perPage.toString());

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Hook to fetch paginated patients list.
 */
export function usePatients(params?: PatientsQueryParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: async () => {
      const queryString = buildQueryString(params);
      const data = await api<PatientsResponse>(`/patients${queryString}`);
      return data;
    },
  });
}

/**
 * Hook to fetch a single patient by ID.
 */
export function usePatient(id: string | null) {
  return useQuery({
    queryKey: patientKeys.detail(id!),
    queryFn: async () => {
      const data = await api<PatientResponse>(`/patients/${id}`);
      return data.patient;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new patient.
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientInput) => {
      const response = await api<PatientResponse>("/patients", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast.success("Paciente criado com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao criar paciente");
      } else {
        toast.error("Erro ao criar paciente");
      }
    },
  });
}

/**
 * Hook to update an existing patient.
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePatientInput;
    }) => {
      const response = await api<PatientResponse>(`/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response.patient;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({
        queryKey: patientKeys.detail(patient.id),
      });
      toast.success("Paciente atualizado com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao atualizar paciente");
      } else {
        toast.error("Erro ao atualizar paciente");
      }
    },
  });
}

/**
 * Hook to delete (soft delete) a patient.
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api(`/patients/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast.success("Paciente removido com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao remover paciente");
      } else {
        toast.error("Erro ao remover paciente");
      }
    },
  });
}
