import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfraAuthModule } from './infra/auth/auth.module';
import { EnvModule } from './infra/env/env.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EnvModule,
    InfraAuthModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
