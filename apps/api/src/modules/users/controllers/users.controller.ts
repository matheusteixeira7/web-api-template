import { Roles } from '@/infra/auth/roles.decorator';
import { UserRole } from '@/shared/types/user-role.enum';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  CreateUserInputDto,
  CreateUserResponseDto,
} from '../dto/create-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { FindUserUseCase } from '../use-cases/find-user.usecase';

/**
 * Controller for user management endpoints.
 *
 * @remarks
 * Handles CRUD operations for users.
 * All endpoints require authentication (JWT guard applied globally).
 * Role-based access control is applied per endpoint.
 */
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  /**
   * Creates a new user in the clinic.
   *
   * @param createUserDto - The user creation data
   * @returns The created user without password
   * @requires ADMIN role
   */
  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createUserDto: CreateUserInputDto,
  ): Promise<CreateUserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  /**
   * Finds a user by their ID.
   *
   * @param id - The user's unique identifier
   * @returns The user without password
   * @throws {ResourceNotFoundError} If the user is not found
   * @requires ADMIN role
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findById(@Param('id') id: string) {
    return this.findUserUseCase.execute({ userId: id });
  }
}
