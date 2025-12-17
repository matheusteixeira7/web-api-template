import { UsersRepository } from '@/modules/users/repositories/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from './find-user.usecase';

describe('UsersService', () => {
  let usecase: FindUserUseCase;

  beforeEach(async () => {
    const mockUsersRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserUseCase,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    usecase = module.get<FindUserUseCase>(FindUserUseCase);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });
});
