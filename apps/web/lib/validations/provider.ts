import { z } from "zod";

/**
 * Working hours for a single day.
 */
export interface DayHours {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

/**
 * Working hours schedule per day of week.
 * Keys: "0" = Sunday, "1" = Monday, ... "6" = Saturday
 * Matches JavaScript's Date.getDay() return values.
 */
export interface WorkingHours {
  [key: string]: DayHours | undefined;
}

/**
 * Weekday configuration for the working hours editor.
 */
export const WEEKDAYS = [
  { key: "1", label: "Segunda-feira" },
  { key: "2", label: "Terca-feira" },
  { key: "3", label: "Quarta-feira" },
  { key: "4", label: "Quinta-feira" },
  { key: "5", label: "Sexta-feira" },
  { key: "6", label: "Sabado" },
  { key: "0", label: "Domingo" },
] as const;

/**
 * Default working hours: Monday-Friday 08:00-18:00.
 */
export const DEFAULT_WORKING_HOURS: WorkingHours = {
  "1": { start: "08:00", end: "18:00" },
  "2": { start: "08:00", end: "18:00" },
  "3": { start: "08:00", end: "18:00" },
  "4": { start: "08:00", end: "18:00" },
  "5": { start: "08:00", end: "18:00" },
};

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
 * Zod schema for day hours validation.
 */
const dayHoursSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Formato invalido (HH:mm)"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Formato invalido (HH:mm)"),
});

/**
 * Zod schema for working hours validation.
 */
const workingHoursSchema = z.record(dayHoursSchema.optional());

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
  workingHours: workingHoursSchema.optional(),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;

/**
 * Update provider form schema.
 */
export const updateProviderSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio").optional(),
  specialty: z.string().nullable().optional(),
  defaultAppointmentDuration: z.number().int().positive().optional(),
  workingHours: workingHoursSchema.optional(),
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
