import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { passwordSchema } from '@/shared/schemas/password.schema';
import { ResetPasswordUseCase } from '../use-cases/reset-password.usecase';

const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: passwordSchema,
});

type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

@Controller('/auth/reset-password')
@Public()
export class ResetPasswordController {
  constructor(private resetPassword: ResetPasswordUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async handle(@Body() body: ResetPasswordBody) {
    await this.resetPassword.execute({
      token: body.token,
      password: body.password,
    });

    return { message: 'Password reset successfully' };
  }
}
