import { FindUserUseCase } from '@/modules/users/use-cases/find-user.usecase';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../controllers/users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [FindUserUseCase],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
