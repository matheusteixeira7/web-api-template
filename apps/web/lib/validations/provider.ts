import { z } from "zod";

/**
 * Provider entity type (matches backend).
 */
export const providerSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  name: z.string(),
  specialty: z.string().nullable(),
  defaultAppointmentDuration: z.number().int().positive(),
  workingHours: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Provider = z.infer<typeof providerSchema>;

/**
 * Create provider form schema.
 */
export const createProviderSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  specialty: z.string().optional(),
  defaultAppointmentDuration: z
    .number()
    .int()
    .positive("Duracao deve ser positiva")
    .default(30),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;

/**
 * Update provider form schema.
 */
export const updateProviderSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio").optional(),
  specialty: z.string().nullable().optional(),
  defaultAppointmentDuration: z.number().int().positive().optional(),
});

export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

/**
 * API response type for paginated providers list.
 */
export interface ProvidersResponse {
  providers: Provider[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * API response type for single provider.
 */
export interface ProviderResponse {
  provider: Provider;
}

/**
 * Query params for fetching providers.
 */
export interface ProvidersQueryParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  specialty?: string;
  sortBy?: "name" | "specialty" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  perPage?: number;
}
