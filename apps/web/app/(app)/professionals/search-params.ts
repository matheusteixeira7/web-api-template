import {
  parseAsString,
  parseAsStringLiteral,
  parseAsInteger,
} from "nuqs";

/**
 * Status filter options.
 */
export const statusOptions = ["all", "active", "inactive"] as const;
export type StatusFilter = (typeof statusOptions)[number];

/**
 * Sort column options.
 */
export const sortColumns = ["name", "specialty", "createdAt"] as const;
export type SortColumn = (typeof sortColumns)[number];

/**
 * Sort direction options.
 */
export const sortDirections = ["asc", "desc"] as const;
export type SortDirection = (typeof sortDirections)[number];

/**
 * Nuqs parsers for URL state management.
 */
export const searchParser = parseAsString.withDefault("");
export const statusParser =
  parseAsStringLiteral(statusOptions).withDefault("all");
export const specialtyParser = parseAsString.withDefault("");
export const sortByParser =
  parseAsStringLiteral(sortColumns).withDefault("name");
export const sortDirParser =
  parseAsStringLiteral(sortDirections).withDefault("asc");
export const pageParser = parseAsInteger.withDefault(1);
export const perPageParser = parseAsInteger.withDefault(10);

/**
 * Combined search params type.
 */
export interface ProvidersSearchParams {
  search: string;
  status: StatusFilter;
  specialty: string;
  sortBy: SortColumn;
  sortDir: SortDirection;
  page: number;
  perPage: number;
}
