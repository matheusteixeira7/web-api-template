import { Global, Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { MailService } from './mail.service';

/**
 * MailModule - Global module for email services
 *
 * This module provides injectable mail service for sending emails
 * via dependency injection using Resend.
 *
 * Usage:
 * @Injectable()
 * export class SomeService {
 *   constructor(private readonly mailService: MailService) {}
 * }
 *
 * Benefits:
 * - Centralized mail configuration
 * - Easy to mock in tests
 * - Follows NestJS DI patterns
 */
@Global()
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: MailService,
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return new MailService({
          resendApiKey: env.get('RESEND_API_KEY'),
          mailFrom: env.get('MAIL_FROM'),
          frontendUrl: env.get('FRONTEND_URL'),
        });
      },
    },
  ],
  exports: [MailService],
})
export class MailModule {}
