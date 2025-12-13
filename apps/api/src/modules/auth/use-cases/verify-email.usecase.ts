import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma.service';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';

interface VerifyEmailRequest {
  token: string;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(UsersApi) private readonly usersApi: UsersApi,
  ) {}

  async execute({ token }: VerifyEmailRequest): Promise<void> {
    const verifyToken = await this.prisma.client.emailVerifyToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verifyToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verifyToken.expiresAt < new Date()) {
      await this.prisma.client.emailVerifyToken.delete({ where: { token } });
      throw new BadRequestException('Verification token expired');
    }

    // Mark email as verified via facade
    await this.usersApi.verifyEmailAddress(verifyToken.userId);

    // Delete the token
    await this.prisma.client.emailVerifyToken.delete({ where: { token } });
  }
}
