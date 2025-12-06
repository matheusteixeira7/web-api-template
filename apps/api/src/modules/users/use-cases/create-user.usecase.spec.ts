import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';

describe('UsersService', () => {
  let usecase: CreateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateUserUseCase],
    }).compile();

    usecase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });
});
