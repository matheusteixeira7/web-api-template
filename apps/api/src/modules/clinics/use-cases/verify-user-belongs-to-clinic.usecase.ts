import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable } from '@nestjs/common';

/**
 * VerifyUserBelongsToClinicUseCase - Authorization check
 *
 * Verifies if a user belongs to a specific clinic.
 * Uses UsersApi facade for cross-module communication.
 */
@Injectable()
export class VerifyUserBelongsToClinicUseCase {
  constructor(@Inject(UsersApi) private readonly usersApi: UsersApi) {}

  /**
   * Verifies if a user belongs to the specified clinic.
   *
   * @param userId - The user ID to check
   * @param clinicId - The clinic ID to verify against
   * @returns True if the user belongs to the clinic, false otherwise
   */
  async execute(userId: string, clinicId: string): Promise<boolean> {
    const user = await this.usersApi.findById(userId);
    return user?.clinicId === clinicId;
  }
}
