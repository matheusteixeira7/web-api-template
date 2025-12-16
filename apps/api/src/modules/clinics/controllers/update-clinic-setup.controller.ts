import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { UserRole } from '@/shared/types/user-role.enum';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import {
  updateClinicSetupBodySchema,
  type UpdateClinicSetupBodyDto,
} from '../dto/update-clinic-setup.dto';
import { UpdateClinicSetupUseCase } from '../use-cases/update-clinic-setup.usecase';

/**
 * Controller for handling clinic setup updates.
 *
 * @remarks
 * This endpoint is part of the onboarding flow where clinic administrators
 * configure their clinic's basic information and operating hours.
 * Only users with ADMIN role can access this endpoint.
 *
 * @example
 * ```
 * PATCH /clinics/setup
 * {
 *   "name": "Health Center",
 *   "contactPhone": "11999999999",
 *   "businessHours": { "monday": { "start": "08:00", "end": "18:00", "closed": false } },
 *   "timezone": "America/Sao_Paulo"
 * }
 * ```
 */
@Controller('/clinics/setup')
export class UpdateClinicSetupController {
  constructor(private updateClinicSetup: UpdateClinicSetupUseCase) {}

  /**
   * Handles the PATCH request to update clinic setup information.
   *
   * @param user - The authenticated user's JWT payload
   * @param body - The validated request body containing clinic setup data
   * @returns The updated clinic entity
   */
  @Patch()
  @Roles(UserRole.ADMIN)
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(updateClinicSetupBodySchema))
    body: UpdateClinicSetupBodyDto,
  ) {
    const {
      name,
      contactPhone,
      contactEmail,
      businessHours,
      timezone,
      averageAppointmentValue,
    } = body;

    const { clinic } = await this.updateClinicSetup.execute({
      userId: user.sub,
      clinicId: user.clinicId,
      name,
      contactPhone,
      contactEmail,
      businessHours,
      timezone,
      averageAppointmentValue,
    });

    return { clinic };
  }
}
