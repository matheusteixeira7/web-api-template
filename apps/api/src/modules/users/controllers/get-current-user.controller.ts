import { Controller, Get } from '@nestjs/common';
import { prisma } from '@workspace/database';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { FindUserUseCase } from '../use-cases/find-user.usecase';

@Controller('/me')
export class GetCurrentUserController {
  constructor(private findUser: FindUserUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const { user } = await this.findUser.execute({ userId: currentUser.sub });

    // Fetch clinic setup status
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: { isSetupComplete: true },
    });

    return {
      user: {
        ...user,
        isClinicSetupComplete: clinic?.isSetupComplete ?? false,
      },
    };
  }
}
