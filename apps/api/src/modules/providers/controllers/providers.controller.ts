import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { UserRole } from '@/shared/types/user-role.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  createProviderBodySchema,
  type CreateProviderBodyDto,
} from '../dto/create-provider.dto';
import {
  findProvidersQuerySchema,
  type FindProvidersQueryDto,
} from '../dto/find-provider.dto';
import {
  providerAvailabilityQuerySchema,
  type ProviderAvailabilityQueryDto,
} from '../dto/provider-availability.dto';
import {
  updateProviderBodySchema,
  type UpdateProviderBodyDto,
} from '../dto/update-provider.dto';
import { CreateProviderUseCase } from '../use-cases/create-provider.usecase';
import { DeleteProviderUseCase } from '../use-cases/delete-provider.usecase';
import { FindProviderByIdUseCase } from '../use-cases/find-provider-by-id.usecase';
import { FindProvidersByClinicUseCase } from '../use-cases/find-providers-by-clinic.usecase';
import { GetProviderAvailabilityUseCase } from '../use-cases/get-provider-availability.usecase';
import { UpdateProviderUseCase } from '../use-cases/update-provider.usecase';

/**
 * Controller for provider management endpoints.
 *
 * @remarks
 * Handles CRUD operations for healthcare providers (doctors, therapists, etc.).
 * All endpoints require authentication (JWT guard applied globally).
 * Most endpoints require ADMIN role, but listing providers is available to all users.
 */
@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly createProviderUseCase: CreateProviderUseCase,
    private readonly findProviderByIdUseCase: FindProviderByIdUseCase,
    private readonly findProvidersByClinicUseCase: FindProvidersByClinicUseCase,
    private readonly updateProviderUseCase: UpdateProviderUseCase,
    private readonly deleteProviderUseCase: DeleteProviderUseCase,
    private readonly getProviderAvailabilityUseCase: GetProviderAvailabilityUseCase,
  ) {}

  /**
   * Creates a new provider in the clinic.
   *
   * @param user - The authenticated user's JWT payload
   * @param body - The provider creation data
   * @returns The created provider entity
   * @requires ADMIN role
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createProviderBodySchema))
    body: CreateProviderBodyDto,
  ) {
    const { provider } = await this.createProviderUseCase.execute({
      clinicId: user.clinicId,
      ...body,
    });

    return { provider };
  }

  /**
   * Lists all providers belonging to the user's clinic with filtering and pagination.
   *
   * @param user - The authenticated user's JWT payload
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of provider entities with total count
   */
  @Get()
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(findProvidersQuerySchema))
    query: FindProvidersQueryDto,
  ) {
    const result = await this.findProvidersByClinicUseCase.execute({
      clinicId: user.clinicId,
      ...query,
    });

    return result;
  }

  /**
   * Gets available time slots for a provider within a date range.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The provider's unique identifier
   * @param query - Date range parameters (startDate, endDate)
   * @returns Available time slots organized by day
   */
  @Get(':id/availability')
  async getAvailability(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Query(new ZodValidationPipe(providerAvailabilityQuerySchema))
    query: ProviderAvailabilityQueryDto,
  ) {
    return this.getProviderAvailabilityUseCase.execute({
      providerId: id,
      clinicId: user.clinicId,
      ...query,
    });
  }

  /**
   * Finds a provider by their ID.
   *
   * @param id - The provider's unique identifier
   * @returns The provider entity
   * @throws {ResourceNotFoundError} If the provider is not found
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const provider = await this.findProviderByIdUseCase.execute(id);

    if (!provider) {
      throw new ResourceNotFoundError();
    }

    return { provider };
  }

  /**
   * Updates an existing provider.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The provider's unique identifier
   * @param body - The provider update data
   * @returns The updated provider entity
   * @requires ADMIN role
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProviderBodySchema))
    body: UpdateProviderBodyDto,
  ) {
    const { provider } = await this.updateProviderUseCase.execute({
      providerId: id,
      clinicId: user.clinicId,
      ...body,
    });

    return { provider };
  }

  /**
   * Soft deletes a provider.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The provider's unique identifier
   * @requires ADMIN role
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.deleteProviderUseCase.execute({
      providerId: id,
      clinicId: user.clinicId,
    });
  }
}
