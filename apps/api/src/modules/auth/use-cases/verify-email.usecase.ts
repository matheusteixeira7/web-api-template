import { BadRequestException } from '@nestjs/common';
import { prisma } from '@workspace/database';

interface VerifyEmailRequest {
  token: string;
}

export class VerifyEmailUseCase {
  async execute({ token }: VerifyEmailRequest): Promise<void> {
    const verifyToken = await prisma.emailVerifyToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verifyToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verifyToken.expiresAt < new Date()) {
      await prisma.emailVerifyToken.delete({ where: { token } });
      throw new BadRequestException('Verification token expired');
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verifyToken.userId },
      data: { emailVerified: true },
    });

    // Delete the token
    await prisma.emailVerifyToken.delete({ where: { token } });
  }
}
