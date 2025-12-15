import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { FindUserWithClinicUseCase } from '../use-cases/find-user-with-clinic.usecase';

/**
 * Controller for retrieving the current authenticated user.
 *
 * @remarks
 * Protected endpoint that returns the authenticated user's data.
 * Used by the frontend to display user info and determine onboarding status.
 */
@Controller('/me')
export class GetCurrentUserController {
  constructor(private findUserWithClinic: FindUserWithClinicUseCase) {}

  /**
   * Gets the current authenticated user's data.
   *
   * @param currentUser - The authenticated user's JWT payload
   * @returns The user data without password
   * @throws {ResourceNotFoundError} If the user is not found
   */
  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.findUserWithClinic.execute(currentUser.sub);

    if (!result) {
      throw new ResourceNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = result.user;

    return {
      user: {
        ...userWithoutPassword,
        isClinicSetupComplete: result.clinic.isSetupComplete,
      },
    };
  }
}
