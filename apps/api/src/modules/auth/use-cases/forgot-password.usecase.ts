import { randomUUID } from 'crypto';
import { prisma } from '@workspace/database';
import type { MailService } from '@/infra/mail/mail.service';
import type { UsersRepository } from '@/modules/users/repositories/users.repository';

interface ForgotPasswordRequest {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async execute({ email }: ForgotPasswordRequest): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);

    // Don't reveal if user exists or not
    if (!user) {
      return;
    }

    // Delete existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await prisma.passwordResetToken.create({
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
