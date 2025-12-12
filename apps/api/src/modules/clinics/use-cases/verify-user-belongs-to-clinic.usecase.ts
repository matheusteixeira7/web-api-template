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

  async execute(userId: string, clinicId: string): Promise<boolean> {
    const user = await this.usersApi.findById(userId);
    return user?.clinicId === clinicId;
  }
}
