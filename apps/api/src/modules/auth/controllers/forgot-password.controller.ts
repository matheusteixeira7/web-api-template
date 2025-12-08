import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.usecase';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;

@Controller('/auth/forgot-password')
@Public()
export class ForgotPasswordController {
  constructor(private forgotPassword: ForgotPasswordUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async handle(@Body() body: ForgotPasswordBody) {
    await this.forgotPassword.execute({ email: body.email });

    // Always return success to not reveal if email exists
    return { message: 'If the email exists, a reset link has been sent' };
  }
}
