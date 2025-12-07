import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { FastifyReply } from 'fastify';
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
  async handle(
    @Body() body: AuthenticateBody,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const { email, password } = body;

    const { accessToken } = await this.authenticateUser.execute({
      email,
      password,
    });

    response.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      access_token: accessToken,
    };
  }
}
