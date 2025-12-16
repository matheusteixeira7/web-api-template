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
  createPatientBodySchema,
  type CreatePatientBodyDto,
} from '../dto/create-patient.dto';
import {
  findPatientsQuerySchema,
  type FindPatientsQueryDto,
} from '../dto/find-patient.dto';
import {
  updatePatientBodySchema,
  type UpdatePatientBodyDto,
} from '../dto/update-patient.dto';
import { CreatePatientUseCase } from '../use-cases/create-patient.usecase';
import { DeletePatientUseCase } from '../use-cases/delete-patient.usecase';
import { FindPatientByIdUseCase } from '../use-cases/find-patient-by-id.usecase';
import { FindPatientsByClinicUseCase } from '../use-cases/find-patients-by-clinic.usecase';
import { UpdatePatientUseCase } from '../use-cases/update-patient.usecase';

/**
 * Controller for patient management endpoints.
 *
 * @remarks
 * Handles CRUD operations for patients.
 * All endpoints require authentication (JWT guard applied globally).
 * Most endpoints require ADMIN role, but listing patients is available to all users.
 */
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly findPatientByIdUseCase: FindPatientByIdUseCase,
    private readonly findPatientsByClinicUseCase: FindPatientsByClinicUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly deletePatientUseCase: DeletePatientUseCase,
  ) {}

  /**
   * Creates a new patient in the clinic.
   *
   * @param user - The authenticated user's JWT payload
   * @param body - The patient creation data
   * @returns The created patient entity
   * @requires USER role
   */
  @Post()
  @Roles(UserRole.USER)
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(createPatientBodySchema))
    body: CreatePatientBodyDto,
  ) {
    const { patient } = await this.createPatientUseCase.execute({
      clinicId: user.clinicId,
      ...body,
    });

    return { patient };
  }

  /**
   * Lists all patients belonging to the user's clinic with filtering and pagination.
   *
   * @param user - The authenticated user's JWT payload
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of patient entities with total count
   */
  @Get()
  async findAll(
    @CurrentUser() user: UserPayload,
    @Query(new ZodValidationPipe(findPatientsQuerySchema))
    query: FindPatientsQueryDto,
  ) {
    const result = await this.findPatientsByClinicUseCase.execute({
      clinicId: user.clinicId,
      ...query,
    });

    return result;
  }

  /**
   * Finds a patient by their ID within the user's clinic.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The patient's unique identifier
   * @returns The patient entity
   * @throws {ResourceNotFoundError} If the patient is not found or doesn't belong to the clinic
   */
  @Get(':id')
  async findById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    const patient = await this.findPatientByIdUseCase.execute({
      patientId: id,
      clinicId: user.clinicId,
    });

    if (!patient) {
      throw new ResourceNotFoundError();
    }

    return { patient };
  }

  /**
   * Updates an existing patient.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The patient's unique identifier
   * @param body - The patient update data
   * @returns The updated patient entity
   * @requires ADMIN role
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePatientBodySchema))
    body: UpdatePatientBodyDto,
  ) {
    const { patient } = await this.updatePatientUseCase.execute({
      patientId: id,
      clinicId: user.clinicId,
      ...body,
    });

    return { patient };
  }

  /**
   * Soft deletes a patient.
   *
   * @param user - The authenticated user's JWT payload
   * @param id - The patient's unique identifier
   * @requires ADMIN role
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.deletePatientUseCase.execute({
      patientId: id,
      clinicId: user.clinicId,
    });
  }
}
