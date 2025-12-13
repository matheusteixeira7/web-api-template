import type { User } from '../entities/user.entity';

/**
 * Extended user type including clinic setup status.
 *
 * @remarks
 * Used when fetching user data along with their clinic information.
 * Typically returned by repository methods that join user and clinic data.
 */
export interface UserWithClinicStatus extends User {
  /** Indicates whether the user's clinic has completed onboarding */
  isClinicSetupComplete: boolean;
}
