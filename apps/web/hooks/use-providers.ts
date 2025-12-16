"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type {
  Provider,
  ProvidersResponse,
  ProviderResponse,
  CreateProviderInput,
  UpdateProviderInput,
  ProvidersQueryParams,
} from "@/lib/validations/provider";
import { toast } from "sonner";

/**
 * Query key factory for providers.
 */
export const providerKeys = {
  all: ["providers"] as const,
  list: (params?: ProvidersQueryParams) =>
    [...providerKeys.all, "list", params] as const,
  detail: (id: string) => [...providerKeys.all, "detail", id] as const,
};

/**
 * Build query string from params object.
 */
function buildQueryString(params?: ProvidersQueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.specialty) searchParams.set("specialty", params.specialty);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortDir) searchParams.set("sortDir", params.sortDir);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.perPage) searchParams.set("perPage", params.perPage.toString());

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Hook to fetch paginated providers list.
 */
export function useProviders(params?: ProvidersQueryParams) {
  return useQuery({
    queryKey: providerKeys.list(params),
    queryFn: async () => {
      const queryString = buildQueryString(params);
      const data = await api<ProvidersResponse>(`/providers${queryString}`);
      return data;
    },
  });
}

/**
 * Hook to fetch a single provider by ID.
 */
export function useProvider(id: string | null) {
  return useQuery({
    queryKey: providerKeys.detail(id!),
    queryFn: async () => {
      const data = await api<ProviderResponse>(`/providers/${id}`);
      return data.provider;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new provider.
 */
export function useCreateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProviderInput) => {
      const response = await api<ProviderResponse>("/providers", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.provider;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      toast.success("Profissional criado com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao criar profissional");
      } else {
        toast.error("Erro ao criar profissional");
      }
    },
  });
}

/**
 * Hook to update an existing provider.
 */
export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProviderInput;
    }) => {
      const response = await api<ProviderResponse>(`/providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response.provider;
    },
    onSuccess: (provider) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      queryClient.invalidateQueries({
        queryKey: providerKeys.detail(provider.id),
      });
      toast.success("Profissional atualizado com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao atualizar profissional");
      } else {
        toast.error("Erro ao atualizar profissional");
      }
    },
  });
}

/**
 * Hook to delete (soft delete) a provider.
 */
export function useDeleteProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api(`/providers/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerKeys.all });
      toast.success("Profissional removido com sucesso");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Erro ao remover profissional");
      } else {
        toast.error("Erro ao remover profissional");
      }
    },
  });
}
