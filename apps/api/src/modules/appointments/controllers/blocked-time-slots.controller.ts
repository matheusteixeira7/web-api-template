import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { UserRole } from '@/shared/types/user-role.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  createBlockedTimeSlotBodySchema,
  findBlockedTimeSlotsQuerySchema,
  type CreateBlockedTimeSlotBodyDto,
  type FindBlockedTimeSlotsQueryDto,
} from '../dto/blocked-time-slot.dto';
import { CreateBlockedTimeSlotUseCase } from '../use-cases/create-blocked-time-slot.usecase';
import { DeleteBlockedTimeSlotUseCase } from '../use-cases/delete-blocked-time-slot.usecase';
import { FindBlockedTimeSlotsUseCase } from '../use-cases/find-blocked-time-slots.usecase';

/**
 * Controller for blocked time slot management endpoints.
 *
 * @remarks
 * Handles CRUD operations for blocked time slots (provider unavailability).
 * Creating and deleting blocked time slots requires ADMIN role.
 * All endpoints require authentication (JWT guard applied globally).
 */
@Controller('blocked-time-slots')
export class BlockedTimeSlotsController {
  constructor(
    private readonly createBlockedTimeSlotUseCase: CreateBlockedTimeSlotUseCase,
    private readonly findBlockedTimeSlotsUseCase: FindBlockedTimeSlotsUseCase,
    private readonly deleteBlockedTimeSlotUseCase: DeleteBlockedTimeSlotUseCase,
  ) {}

  /**
   * Creates a new blocked time slot.
   *
   * @param user - The authenticated user's JWT payload
   * @param body - The blocked time slot creation data
   * @returns The created blocked time slot entity
   * @requires ADMIN role
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createBlockedTimeSlotBodySchema))
    body: CreateBlockedTimeSlotBodyDto,
  ) {
    const { blockedTimeSlot } = await this.createBlockedTimeSlotUseCase.execute(
      {
        clinicId: user.clinicId,
        createdById: user.sub,
        ...body,
      },
    );

    return { blockedTimeSlot };
  }

  /**
   * Lists blocked time slots for a provider with optional filters.
   *
   * @param user - The authenticated user's JWT payload
   * @param query - Query parameters for filtering
   * @returns List of blocked time slot entities
   */
  @Get()
  async findByProvider(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(findBlockedTimeSlotsQuerySchema))
    query: FindBlockedTimeSlotsQueryDto,
  ) {
    const { blockedTimeSlots } = await this.findBlockedTimeSlotsUseCase.execute(
      {
        providerId: query.providerId,
        clinicId: user.clinicId,
        locationId: query.locationId,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    );

    return { blockedTimeSlots };
  }

  /**
   * Deletes a blocked time slot.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The blocked time slot's unique identifier
   * @requires ADMIN role
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.deleteBlockedTimeSlotUseCase.execute({
      blockedTimeSlotId: id,
      clinicId: user.clinicId,
    });
  }
}
