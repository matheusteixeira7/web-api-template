import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { VerifyEmailUseCase } from '../use-cases/verify-email.usecase';

const verifyEmailSchema = z.object({
  token: z.string().uuid(),
});

type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;

@Controller('/auth/verify-email')
@Public()
export class VerifyEmailController {
  constructor(private verifyEmail: VerifyEmailUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(verifyEmailSchema))
  async handle(@Body() body: VerifyEmailBody) {
    await this.verifyEmail.execute({ token: body.token });

    return { message: 'Email verified successfully' };
  }
}
