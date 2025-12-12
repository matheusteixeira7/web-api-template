import { PrismaService } from '@/infra/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  RefreshTokenData,
  RefreshTokensRepository,
} from './refresh-tokens.repository';

@Injectable()
export class PrismaRefreshTokensRepository extends RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenData> {
    const refreshToken = await this.prisma.client.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });

    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshTokenData | null> {
    const refreshToken = await this.prisma.client.refreshToken.findUnique({
      where: { token },
    });

    return refreshToken;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.client.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.client.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.client.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
