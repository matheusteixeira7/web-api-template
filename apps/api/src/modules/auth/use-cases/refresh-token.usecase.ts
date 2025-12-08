import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Encrypter } from '@/shared/cryptography/encrypter';
import type { UsersRepository } from '@/modules/users/repositories/users.repository';
import type { RefreshTokensRepository } from '../repositories/refresh-tokens.repository';

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly usersRepository: UsersRepository,
    private readonly encrypter: Encrypter,
  ) {}

  async execute({
    refreshToken,
  }: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const storedToken =
      await this.refreshTokensRepository.findByToken(refreshToken);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokensRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersRepository.findById(storedToken.userId);

    if (!user) {
      await this.refreshTokensRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token
    await this.refreshTokensRepository.deleteByToken(refreshToken);

    // Generate new access token
    const accessToken = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    });

    // Generate new refresh token
    const newRefreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokensRepository.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
