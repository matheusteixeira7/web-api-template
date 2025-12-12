"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { api, ApiError } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  clinicId: string;
  isClinicSetupComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionResponse {
  user: User;
}

export function useSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        return await api<SessionResponse>("/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const signOut = useCallback(async () => {
    // Limpa o cache do React Query
    queryClient.setQueryData(["session"], null);
    queryClient.invalidateQueries({ queryKey: ["session"] });

    // Chama endpoint de logout (se existir) ou redireciona
    try {
      await api("/sessions", { method: "DELETE" });
    } catch {
      // Ignora erros no logout
    }

    router.push("/auth/login");
  }, [queryClient, router]);

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data?.user,
    needsSetup: query.data?.user && !query.data.user.isClinicSetupComplete,
    error: query.error,
    signOut,
    refetch: query.refetch,
  };
}
