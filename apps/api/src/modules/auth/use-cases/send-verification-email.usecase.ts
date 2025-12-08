import { randomUUID } from 'crypto';
import { prisma } from '@workspace/database';
import type { MailService } from '@/infra/mail/mail.service';
import type { UsersRepository } from '@/modules/users/repositories/users.repository';

interface SendVerificationEmailRequest {
  userId: string;
}

export class SendVerificationEmailUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async execute({ userId }: SendVerificationEmailRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      return; // Already verified
    }

    // Delete existing tokens for this user
    await prisma.emailVerifyToken.deleteMany({
      where: { userId },
    });

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.emailVerifyToken.create({
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
