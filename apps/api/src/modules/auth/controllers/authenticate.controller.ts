import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { AuthenticateUserUseCase } from '../use-cases/authenticate-user.usecase';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBody = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBody) {
    const { email, password } = body;

    const { accessToken } = await this.authenticateUser.execute({
      email,
      password,
    });

    return {
      access_token: accessToken,
    };
  }
}
