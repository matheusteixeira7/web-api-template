import { Module } from '@nestjs/common';
import { UsersService } from './use-cases/find-one-user.usecase';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
