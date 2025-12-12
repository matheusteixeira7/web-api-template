import { PrismaService } from '@/infra/database/prisma.service';
import { MailService } from '@/infra/mail/mail.service';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface SendVerificationEmailRequest {
  userId: string;
}

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    @Inject(UsersApi) private readonly usersApi: UsersApi,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async execute({ userId }: SendVerificationEmailRequest): Promise<void> {
    const user = await this.usersApi.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      return; // Already verified
    }

    // Delete existing tokens for this user
    await this.prisma.client.emailVerifyToken.deleteMany({
      where: { userId },
    });

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await this.prisma.client.emailVerifyToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Send email
    await this.mailService.sendVerificationEmail(user.email, token);
  }
}
