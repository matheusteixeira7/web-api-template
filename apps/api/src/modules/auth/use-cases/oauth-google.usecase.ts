import { RegisterUserApplicationService } from '@/application/services/register-user-application.service';
import { PrismaService } from '@/infra/database/prisma.service';
import { EnvService } from '@/infra/env/env.service';
import { CLINIC_DEFAULTS } from '@/shared/constants/clinic.constants';
import { Encrypter } from '@/shared/cryptography/encrypter';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  OAuthGoogleRequestDto,
  OAuthGoogleResponseDto,
} from '../dto/oauth-google.dto';
import { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';
import type {
  GoogleTokenResponse,
  GoogleUserInfo,
} from '../types/google-oauth.types';

@Injectable()
export class OAuthGoogleUseCase {
  constructor(
    private readonly encrypter: Encrypter,
    @Inject(UsersApi) private readonly usersApi: UsersApi,
    private readonly registerUserAppService: RegisterUserApplicationService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
  ) {}

  async execute({
    code,
  }: OAuthGoogleRequestDto): Promise<OAuthGoogleResponseDto> {
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await this.getGoogleUserInfo(tokenResponse.access_token);

    if (!googleUser.verified_email) {
      throw new UnauthorizedException('Google email not verified');
    }

    // Find or create user
    let user = await this.prisma.client.user.findUnique({
      where: { email: googleUser.email },
      include: {
        oauthAccounts: {
          where: { provider: 'google' },
        },
      },
    });

    if (user) {
      // Check if OAuth account exists
      const oauthAccount = user.oauthAccounts.find(
        (acc) => acc.provider === 'google' && acc.providerId === googleUser.id,
      );

      if (!oauthAccount) {
        // Link Google account to existing user
        await this.prisma.client.oAuthAccount.create({
          data: {
            provider: 'google',
            providerId: googleUser.id,
            userId: user.id,
          },
        });
      }

      // Mark email as verified if not already via facade
      if (!user.emailVerified) {
        await this.usersApi.verifyEmailAddress(user.id);
      }
    } else {
      // Create new user with clinic via Application Service
      const newUser = await this.registerUserAppService.execute({
        name: googleUser.name ?? '',
        email: googleUser.email,
        hashedPassword: null,
        emailVerified: true,
        clinicName: CLINIC_DEFAULTS.NAME,
      });

      // Create OAuth account linking
      await this.prisma.client.oAuthAccount.create({
        data: {
          provider: 'google',
          providerId: googleUser.id,
          userId: newUser.id,
        },
      });

      user = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        clinicId: newUser.clinicId,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        deletedAt: newUser.deletedAt,
        oauthAccounts: [],
      };
    }

    // Generate tokens
    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
      clinicId: user.clinicId,
    });

    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokensRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    const csrfToken = randomUUID();

    return {
      accessToken,
      refreshToken,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private async exchangeCodeForTokens(
    code: string,
  ): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.env.get('GOOGLE_CLIENT_ID'),
        client_secret: this.env.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: `${this.env.get('FRONTEND_URL')}/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange code for tokens');
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  private async getGoogleUserInfo(
    accessToken: string,
  ): Promise<GoogleUserInfo> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('Failed to get Google user info');
    }

    return response.json() as Promise<GoogleUserInfo>;
  }
}
