import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfraAuthModule } from './infra/auth/auth.module';
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
    InfraAuthModule,
    AuthModule,
    ClinicsModule,
    UsersModule,
  ],
})
export class AppModule {}
