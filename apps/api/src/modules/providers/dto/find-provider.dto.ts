import { z } from 'zod';
import type { Provider } from '../entities/provider.entity';
import {
  sortByValues,
  sortDirValues,
  statusFilterValues,
} from '../types/provider-filters.types';

/**
 * Zod schema for validating find providers query parameters.
 *
 * @property search - Optional search string to filter by name
 * @property status - Filter by active/inactive status (default: 'all')
 * @property specialty - Optional filter by specialty
 * @property sortBy - Column to sort by (default: 'name')
 * @property sortDir - Sort direction (default: 'asc')
 * @property page - Page number for pagination (default: 1)
 * @property perPage - Items per page (default: 10, max: 100)
 */
export const findProvidersQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(statusFilterValues).default('all'),
  specialty: z.string().optional(),
  sortBy: z.enum(sortByValues).default('name'),
  sortDir: z.enum(sortDirValues).default('asc'),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * Output type from the find providers query schema.
 * Uses z.output to get the type after defaults are applied.
 */
export type FindProvidersQueryDto = z.output<typeof findProvidersQuerySchema>;

/** Response DTO containing a single provider entity */
export interface FindProviderResponseDto {
  provider: Provider;
}

/** Response DTO containing a list of provider entities */
export interface FindProvidersResponseDto {
  providers: Provider[];
}

/** Paginated response DTO for providers list */
export interface FindProvidersPaginatedResponseDto {
  providers: Provider[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
