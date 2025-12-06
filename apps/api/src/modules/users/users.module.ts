import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { makeCreateUserUseCase } from './use-cases/factories/make-create-user-use-case.factory';
import { makeFindUserUseCase } from './use-cases/factories/make-find-user-use-case.factory';
import { FindUserUseCase } from './use-cases/find-user.usecase';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: CreateUserUseCase,
      useFactory: makeCreateUserUseCase,
    },
    {
      provide: FindUserUseCase,
      useFactory: makeFindUserUseCase,
    },
  ],
  exports: [
    {
      provide: CreateUserUseCase,
      useFactory: makeCreateUserUseCase,
    },
    {
      provide: FindUserUseCase,
      useFactory: makeFindUserUseCase,
    },
  ],
})
export class UsersModule {}
