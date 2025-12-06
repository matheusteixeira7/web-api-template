import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from './find-user.usecase';

describe('UsersService', () => {
  let usecase: FindUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FindUserUseCase],
    }).compile();

    usecase = module.get<FindUserUseCase>(FindUserUseCase);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
  });
});
