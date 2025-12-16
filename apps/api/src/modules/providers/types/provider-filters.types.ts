/**
 * Allowed values for status filter.
 */
export const statusFilterValues = ['all', 'active', 'inactive'] as const;
export type StatusFilter = (typeof statusFilterValues)[number];

/**
 * Allowed values for sort column.
 */
export const sortByValues = ['name', 'specialty', 'createdAt'] as const;
export type SortByColumn = (typeof sortByValues)[number];

/**
 * Allowed values for sort direction.
 */
export const sortDirValues = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirValues)[number];

/**
 * Filters for finding providers with pagination.
 */
export interface FindProvidersFilters {
  search?: string;
  status: StatusFilter;
  specialty?: string;
  sortBy: SortByColumn;
  sortDir: SortDirection;
  page: number;
  perPage: number;
}

/**
 * Input parameters for finding providers by clinic with filters.
 *
 * @remarks
 * Combines clinicId (from auth context) with optional query filters (from URL params).
 * - clinicId comes from JWT token, not from query params
 * - Query filters are validated by Zod via FindProvidersQueryDto
 */
export interface FindProvidersByClinicInput {
  clinicId: string;
  search?: string;
  status?: StatusFilter;
  specialty?: string;
  sortBy?: SortByColumn;
  sortDir?: SortDirection;
  page?: number;
  perPage?: number;
}
