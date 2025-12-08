import { BadRequestException } from '@nestjs/common';
import { prisma } from '@workspace/database';
import type { HashGenerator } from '@/shared/cryptography/hash-generator';

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export class ResetPasswordUseCase {
  constructor(private readonly hashGenerator: HashGenerator) {}

  async execute({ token, password }: ResetPasswordRequest): Promise<void> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      throw new BadRequestException('Reset token expired');
    }

    if (resetToken.usedAt) {
      throw new BadRequestException('Reset token already used');
    }

    // Hash new password
    const hashedPassword = await this.hashGenerator.hash(password);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
      // Invalidate all refresh tokens for security
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);
  }
}
