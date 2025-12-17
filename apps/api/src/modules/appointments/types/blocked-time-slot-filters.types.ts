/**
 * Filters for finding blocked time slots.
 */
export interface FindBlockedTimeSlotsFilters {
  providerId: string;
  locationId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Input parameters for finding blocked time slots by provider.
 */
export interface FindBlockedTimeSlotsByProviderInput {
  providerId: string;
  clinicId: string;
  locationId?: string;
  startDate?: Date;
  endDate?: Date;
}
