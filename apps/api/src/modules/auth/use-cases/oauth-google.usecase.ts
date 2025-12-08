import type { Encrypter } from '@/shared/cryptography/encrypter';
import { UnauthorizedException } from '@nestjs/common';
import { prisma } from '@workspace/database';
import { randomUUID } from 'crypto';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

interface OAuthGoogleRequest {
  code: string;
}

interface OAuthGoogleResponse {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface OAuthGoogleConfig {
  googleClientId: string;
  googleClientSecret: string;
  redirectUri: string;
}

export class OAuthGoogleUseCase {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly config: OAuthGoogleConfig,
  ) {}

  async execute({ code }: OAuthGoogleRequest): Promise<OAuthGoogleResponse> {
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await this.getGoogleUserInfo(tokenResponse.access_token);

    if (!googleUser.verified_email) {
      throw new UnauthorizedException('Google email not verified');
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { oauthAccounts: true },
    });

    if (user) {
      // Check if OAuth account exists
      const oauthAccount = user.oauthAccounts.find(
        (acc) => acc.provider === 'google' && acc.providerId === googleUser.id,
      );

      if (!oauthAccount) {
        // Link Google account to existing user
        await prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerId: googleUser.id,
            userId: user.id,
          },
        });
      }

      // Mark email as verified if not already
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }
    } else {
      // Create new user with OAuth account
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name ?? null,
          emailVerified: true,
          oauthAccounts: {
            create: {
              provider: 'google',
              providerId: googleUser.id,
            },
          },
        },
        include: { oauthAccounts: true },
      });
    }

    // Generate tokens
    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    });

    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
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
        client_id: this.config.googleClientId,
        client_secret: this.config.googleClientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to exchange code for tokens');
    }

    return response.json();
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

    return response.json();
  }
}
