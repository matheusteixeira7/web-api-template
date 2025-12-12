import { PrismaService } from '@/infra/database/prisma.service';
import { MailService } from '@/infra/mail/mail.service';
import { UsersApi } from '@/shared/public-api/interface/users-api.interface';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface ForgotPasswordRequest {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(UsersApi) private readonly usersApi: UsersApi,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async execute({ email }: ForgotPasswordRequest): Promise<void> {
    const user = await this.usersApi.findByEmail(email);

    // Don't reveal if user exists or not
    if (!user) {
      return;
    }

    // Delete existing tokens for this user
    await this.prisma.client.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await this.prisma.client.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send email
    await this.mailService.sendPasswordResetEmail(user.email, token);
  }
}
