import { FindUserUseCase } from '@/modules/users/use-cases/find-user.usecase';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let findUserUseCase: FindUserUseCase;

  beforeEach(async () => {
    const mockFindUserUseCase = {
      execute: jest.fn(),
      executeWithClinic: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: FindUserUseCase,
          useValue: mockFindUserUseCase,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    findUserUseCase = module.get<FindUserUseCase>(FindUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
