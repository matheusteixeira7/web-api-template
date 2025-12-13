import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { FindUserWithClinicUseCase } from '../use-cases/find-user-with-clinic.usecase';

@Controller('/me')
export class GetCurrentUserController {
  constructor(private findUserWithClinic: FindUserWithClinicUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.findUserWithClinic.execute(currentUser.sub);

    if (!result) {
      throw new ResourceNotFoundError();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = result.user;

    return { user: userWithoutPassword };
  }
}
