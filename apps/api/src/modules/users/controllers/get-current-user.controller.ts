import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { FindUserUseCase } from '../use-cases/find-user.usecase';

@Controller('/me')
export class GetCurrentUserController {
  constructor(private findUser: FindUserUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const { user } = await this.findUser.executeWithClinic({
      userId: currentUser.sub,
    });

    return { user };
  }
}
