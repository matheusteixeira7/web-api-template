import { z } from 'zod';
import type { Patient } from '../entities/patient.entity';
import {
  sortByValues,
  sortDirValues,
  statusFilterValues,
} from '../types/patient-filters.types';

/**
 * Zod schema for validating find patients query parameters.
 *
 * @property search - Optional search string to filter by name, phone, or email
 * @property status - Filter by active/inactive status (default: 'all')
 * @property sortBy - Column to sort by (default: 'name')
 * @property sortDir - Sort direction (default: 'asc')
 * @property page - Page number for pagination (default: 1)
 * @property perPage - Items per page (default: 10, max: 100)
 */
export const findPatientsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(statusFilterValues).default('all'),
  sortBy: z.enum(sortByValues).default('name'),
  sortDir: z.enum(sortDirValues).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Output type from the find patients query schema.
 * Uses z.output to get the type after defaults are applied.
 */
export type FindPatientsQueryDto = z.output<typeof findPatientsQuerySchema>;

/** Response DTO containing a single patient entity */
export interface FindPatientResponseDto {
  patient: Patient;
}

/** Response DTO containing a list of patient entities */
export interface FindPatientsResponseDto {
  patients: Patient[];
}

/** Paginated response DTO for patients list */
export interface FindPatientsPaginatedResponseDto {
  patients: Patient[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
