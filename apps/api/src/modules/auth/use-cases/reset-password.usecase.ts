import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma.service'
import { UsersApi } from '@/shared/public-api/interface/users-api.interface'
import { HashGenerator } from '@/shared/cryptography/hash-generator';

interface ResetPasswordRequest {
  token: string;
  password: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly hashGenerator: HashGenerator,
    @Inject(UsersApi) private readonly usersApi: UsersApi,
    private readonly prisma: PrismaService,
  ) {}

  async execute({ token, password }: ResetPasswordRequest): Promise<void> {
    const resetToken = await this.prisma.client.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.client.passwordResetToken.delete({ where: { token } });
      throw new BadRequestException('Reset token expired');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token already used');
    }

    // Hash new password
    const hashedPassword = await this.hashGenerator.hash(password);

    // Update password via facade
    await this.usersApi.updatePassword(resetToken.userId, hashedPassword);

    // Mark token as used and invalidate refresh tokens
    await this.prisma.client.$transaction([
      this.prisma.client.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
      // Invalidate all refresh tokens for security
      this.prisma.client.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);
  }
}
