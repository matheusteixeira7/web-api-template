import { Public } from '@/infra/auth/public';
import { EnvService } from '@/infra/env/env.service';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Get, Post, Res, UsePipes } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { z } from 'zod';
import { OAuthGoogleUseCase } from '../use-cases/oauth-google.usecase';

const oauthCallbackSchema = z.object({
  code: z.string(),
});

type OAuthCallbackBody = z.infer<typeof oauthCallbackSchema>;

@Controller('/auth/google')
@Public()
export class OAuthGoogleController {
  constructor(
    private oauthGoogle: OAuthGoogleUseCase,
    private env: EnvService,
  ) {}

  @Get('/url')
  getAuthUrl() {
    const clientId = this.env.get('GOOGLE_CLIENT_ID');
    const frontendUrl = this.env.get('FRONTEND_URL');
    const redirectUri = `${frontendUrl}/auth/callback/google`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  @Post('/callback')
  @UsePipes(new ZodValidationPipe(oauthCallbackSchema))
  async handleCallback(
    @Body() body: OAuthCallbackBody,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const { accessToken, refreshToken, csrfToken, user } =
      await this.oauthGoogle.execute({
        code: body.code,
      });

    response.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    response.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.setCookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return {
      user,
      csrf_token: csrfToken,
    };
  }
}
