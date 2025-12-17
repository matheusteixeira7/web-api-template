import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
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
  createAppointmentBodySchema,
  type CreateAppointmentBodyDto,
} from '../dto/create-appointment.dto';
import {
  findAppointmentsByPatientQuerySchema,
  findAppointmentsByProviderQuerySchema,
  findAppointmentsQuerySchema,
  type FindAppointmentsByPatientQueryDto,
  type FindAppointmentsByProviderQueryDto,
  type FindAppointmentsQueryDto,
} from '../dto/find-appointment.dto';
import {
  updateAppointmentStatusBodySchema,
  type UpdateAppointmentStatusBodyDto,
} from '../dto/update-appointment-status.dto';
import {
  updateAppointmentBodySchema,
  type UpdateAppointmentBodyDto,
} from '../dto/update-appointment.dto';
import { CancelAppointmentUseCase } from '../use-cases/cancel-appointment.usecase';
import { CreateAppointmentUseCase } from '../use-cases/create-appointment.usecase';
import { DeleteAppointmentUseCase } from '../use-cases/delete-appointment.usecase';
import { FindAppointmentByIdUseCase } from '../use-cases/find-appointment-by-id.usecase';
import { FindAppointmentsByClinicUseCase } from '../use-cases/find-appointments-by-clinic.usecase';
import { FindAppointmentsByPatientUseCase } from '../use-cases/find-appointments-by-patient.usecase';
import { FindAppointmentsByProviderUseCase } from '../use-cases/find-appointments-by-provider.usecase';
import { UpdateAppointmentStatusUseCase } from '../use-cases/update-appointment-status.usecase';
import { UpdateAppointmentUseCase } from '../use-cases/update-appointment.usecase';

/**
 * Controller for appointment management endpoints.
 *
 * @remarks
 * Handles CRUD operations for appointments.
 * All endpoints require authentication (JWT guard applied globally).
 */
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly findAppointmentByIdUseCase: FindAppointmentByIdUseCase,
    private readonly findAppointmentsByClinicUseCase: FindAppointmentsByClinicUseCase,
    private readonly findAppointmentsByProviderUseCase: FindAppointmentsByProviderUseCase,
    private readonly findAppointmentsByPatientUseCase: FindAppointmentsByPatientUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    private readonly updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly deleteAppointmentUseCase: DeleteAppointmentUseCase,
  ) {}

  /**
   * Creates a new appointment.
   *
   * @param user - The authenticated user's JWT payload
   * @param body - The appointment creation data
   * @returns The created appointment entity
   */
  @Post()
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createAppointmentBodySchema))
    body: CreateAppointmentBodyDto,
  ) {
    const { appointment } = await this.createAppointmentUseCase.execute({
      clinicId: user.clinicId,
      createdById: user.sub,
      ...body,
    });

    return { appointment };
  }

  /**
   * Lists all appointments belonging to the user's clinic with filtering and pagination.
   *
   * @param user - The authenticated user's JWT payload
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of appointment entities with total count
   */
  @Get()
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(findAppointmentsQuerySchema))
    query: FindAppointmentsQueryDto,
  ) {
    const result = await this.findAppointmentsByClinicUseCase.execute({
      clinicId: user.clinicId,
      ...query,
    });

    return result;
  }

  /**
   * Lists all appointments for a specific provider.
   *
   * @param user - The authenticated user's JWT payload
   * @param providerId - The provider's unique identifier
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of appointment entities with total count
   */
  @Get('provider/:providerId')
  async findByProvider(
    @CurrentUser() user: UserPayload,
    @Param('providerId') providerId: string,
    @Query(new ZodValidationPipe(findAppointmentsByProviderQuerySchema))
    query: FindAppointmentsByProviderQueryDto,
  ) {
    const result = await this.findAppointmentsByProviderUseCase.execute({
      providerId,
      clinicId: user.clinicId,
      ...query,
    });

    return result;
  }

  /**
   * Lists all appointments for a specific patient.
   *
   * @param user - The authenticated user's JWT payload
   * @param patientId - The patient's unique identifier
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of appointment entities with total count
   */
  @Get('patient/:patientId')
  async findByPatient(
    @CurrentUser() user: UserPayload,
    @Param('patientId') patientId: string,
    @Query(new ZodValidationPipe(findAppointmentsByPatientQuerySchema))
    query: FindAppointmentsByPatientQueryDto,
  ) {
    const result = await this.findAppointmentsByPatientUseCase.execute({
      patientId,
      clinicId: user.clinicId,
      ...query,
    });

    return result;
  }

  /**
   * Finds an appointment by its ID.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The appointment's unique identifier
   * @returns The appointment entity
   * @throws {ResourceNotFoundError} If the appointment is not found
   */
  @Get(':id')
  async findById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const appointment = await this.findAppointmentByIdUseCase.execute(
      id,
      user.clinicId,
    );

    if (!appointment) {
      throw new ResourceNotFoundError();
    }

    return { appointment };
  }

  /**
   * Updates an existing appointment.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The appointment's unique identifier
   * @param body - The appointment update data
   * @returns The updated appointment entity
   */
  @Patch(':id')
  @HttpCode(200)
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentBodySchema))
    body: UpdateAppointmentBodyDto,
  ) {
    const { appointment } = await this.updateAppointmentUseCase.execute({
      appointmentId: id,
      clinicId: user.clinicId,
      ...body,
    });

    return { appointment };
  }

  /**
   * Updates an appointment's status.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The appointment's unique identifier
   * @param body - The status update data
   * @returns The updated appointment entity and previous status
   */
  @Patch(':id/status')
  @HttpCode(200)
  async updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAppointmentStatusBodySchema))
    body: UpdateAppointmentStatusBodyDto,
  ) {
    const { appointment, previousStatus } =
      await this.updateAppointmentStatusUseCase.execute({
        appointmentId: id,
        clinicId: user.clinicId,
        changedById: user.sub,
        ...body,
      });

    return { appointment, previousStatus };
  }

  /**
   * Cancels an appointment.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The appointment's unique identifier
   * @returns The cancelled appointment entity
   */
  @Patch(':id/cancel')
  @HttpCode(200)
  async cancel(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const { appointment } = await this.cancelAppointmentUseCase.execute({
      appointmentId: id,
      clinicId: user.clinicId,
      cancelledById: user.sub,
    });

    return { appointment };
  }

  /**
   * Soft deletes an appointment.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The appointment's unique identifier
   */
  @Delete(':id')
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.deleteAppointmentUseCase.execute({
      appointmentId: id,
      clinicId: user.clinicId,
    });
  }
}
