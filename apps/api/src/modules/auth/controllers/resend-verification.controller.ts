import { Controller, Post } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { SendVerificationEmailUseCase } from '../use-cases/send-verification-email.usecase';

@Controller('/auth/resend-verification')
export class ResendVerificationController {
  constructor(private sendVerificationEmail: SendVerificationEmailUseCase) {}

  @Post()
  async handle(@CurrentUser() user: UserPayload) {
    await this.sendVerificationEmail.execute({ userId: user.sub });

    return { message: 'Verification email sent' };
  }
}
