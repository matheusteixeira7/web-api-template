import { prisma } from '@workspace/database';
import {
  RefreshTokenData,
  RefreshTokensRepository,
} from './refresh-tokens.repository';

export class PrismaRefreshTokensRepository extends RefreshTokensRepository {
  async create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshTokenData> {
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });

    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshTokenData | null> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    return refreshToken;
  }

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
