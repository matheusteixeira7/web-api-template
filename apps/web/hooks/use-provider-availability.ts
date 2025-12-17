"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AvailabilityResponse } from "@/lib/validations/availability";
import { format } from "date-fns";

/**
 * Query key factory for provider availability.
 */
export const providerAvailabilityKeys = {
  all: ["provider-availability"] as const,
  detail: (providerId: string, startDate: string, endDate: string) =>
    [...providerAvailabilityKeys.all, providerId, startDate, endDate] as const,
};

/**
 * Hook to fetch provider availability for a date range.
 *
 * @param providerId - Provider unique identifier
 * @param startDate - Start of date range
 * @param endDate - End of date range
 */
export function useProviderAvailability(
  providerId: string | null,
  startDate: Date | null,
  endDate: Date | null,
) {
  const startStr = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const endStr = endDate ? format(endDate, "yyyy-MM-dd") : "";

  return useQuery({
    queryKey: providerAvailabilityKeys.detail(providerId!, startStr, endStr),
    queryFn: async () => {
      const data = await api<AvailabilityResponse>(
        `/providers/${providerId}/availability?startDate=${startStr}&endDate=${endStr}`,
      );
      return data;
    },
    enabled: !!providerId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
