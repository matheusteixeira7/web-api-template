import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { InfraAuthModule } from './infra/auth/auth.module';
import { CryptographyModule } from './infra/cryptography/cryptography.module';
import { DatabaseModule } from './infra/database/database.module';
import { MailModule } from './infra/mail/mail.module';
import { envSchema } from './infra/env/env';
import { EnvModule } from './infra/env/env.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    EnvModule,
    DatabaseModule,
    CryptographyModule,
    MailModule,
    ApplicationModule,
    InfraAuthModule,
    AuthModule,
    ClinicsModule,
    UsersModule,
  ],
})
export class AppModule {}
