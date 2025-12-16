/**
 * Allowed values for status filter.
 */
export const statusFilterValues = ['all', 'active', 'inactive'] as const;
export type StatusFilter = (typeof statusFilterValues)[number];

/**
 * Allowed values for sort column.
 */
export const sortByValues = ['name', 'phone', 'email', 'createdAt'] as const;
export type SortByColumn = (typeof sortByValues)[number];

/**
 * Allowed values for sort direction.
 */
export const sortDirValues = ['asc', 'desc'] as const;
export type SortDirection = (typeof sortDirValues)[number];

/**
 * Filters for finding patients with pagination.
 */
export interface FindPatientsFilters {
  search?: string;
  status: StatusFilter;
  sortBy: SortByColumn;
  sortDir: SortDirection;
  page: number;
  perPage: number;
}

/**
 * Input parameters for finding patients by clinic with filters.
 *
 * @remarks
 * Combines clinicId (from auth context) with optional query filters (from URL params).
 * - clinicId comes from JWT token, not from query params
 * - Query filters are validated by Zod via FindPatientsQueryDto
 */
export interface FindPatientsByClinicInput {
  clinicId: string;
  search?: string;
  status?: StatusFilter;
  sortBy?: SortByColumn;
  sortDir?: SortDirection;
  page?: number;
  perPage?: number;
}
