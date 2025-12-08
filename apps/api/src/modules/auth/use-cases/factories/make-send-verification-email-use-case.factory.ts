import { MailService } from '@/infra/mail/mail.service';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { SendVerificationEmailUseCase } from '../send-verification-email.usecase';
import { env } from './config';

export function makeSendVerificationEmailUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const mailService = new MailService({
    resendApiKey: env.RESEND_API_KEY,
    mailFrom: env.MAIL_FROM,
    frontendUrl: env.FRONTEND_URL,
  });

  return new SendVerificationEmailUseCase(usersRepository, mailService);
}
