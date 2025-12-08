import { MailService } from '@/infra/mail/mail.service';
import { PrismaUsersRepository } from '@/modules/users/repositories/prisma-users-repository';
import { ForgotPasswordUseCase } from '../forgot-password.usecase';
import { env } from './config';

export function makeForgotPasswordUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const mailService = new MailService({
    resendApiKey: env.RESEND_API_KEY,
    mailFrom: env.MAIL_FROM,
    frontendUrl: env.FRONTEND_URL,
  });

  return new ForgotPasswordUseCase(usersRepository, mailService);
}
