import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  CreateUserInputDto,
  CreateUserResponseDto,
} from '../dto/create-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { FindUserUseCase } from '../use-cases/find-user.usecase';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  @Post()
  create(
    @Body() createUserDto: CreateUserInputDto,
  ): Promise<CreateUserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.findUserUseCase.execute({ userId: id });
  }
}
