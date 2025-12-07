import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Public } from '@/infra/auth/public';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { AuthenticateUserUseCase } from '../use-cases/authenticate-user.usecase';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBody = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(
    private authenticateUser: AuthenticateUserUseCase,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(
    @Body() body: AuthenticateBody,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const { email, password } = body;

    const { accessToken, userId } = await this.authenticateUser.execute({
      email,
      password,
    });

    // Generate refresh token
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokensRepository.create({
      token: refreshToken,
      userId,
      expiresAt,
    });

    // Generate CSRF token
    const csrfToken = randomUUID();

    response.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    response.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    response.setCookie('csrf_token', csrfToken, {
      httpOnly: false, // Accessible by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return {
      access_token: accessToken,
      csrf_token: csrfToken,
    };
  }
}
