import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Response type for finding a user with their clinic information.
 */
export interface FindUserWithClinicResponse {
  /** The user entity */
  user: User;
  /** Clinic-related information */
  clinic: {
    /** Whether the clinic has completed the onboarding setup */
    isSetupComplete: boolean;
  };
}

/**
 * Use case for finding a user along with their clinic's setup status.
 *
 * @remarks
 * Used by the /me endpoint to return current user data with clinic info.
 * This allows the frontend to determine if onboarding is needed.
 */
@Injectable()
export class FindUserWithClinicUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Finds a user by ID including their clinic's setup status.
   *
   * @param id - The user's unique identifier
   * @returns The user with clinic info if found, null otherwise
   */
  async execute(id: string): Promise<FindUserWithClinicResponse | null> {
    const result = await this.usersRepository.findByIdWithClinic(id);

    if (!result) {
      return null;
    }

    const { isClinicSetupComplete, ...userData } = result;

    return {
      user: new User(userData),
      clinic: {
        isSetupComplete: isClinicSetupComplete,
      },
    };
  }
}
