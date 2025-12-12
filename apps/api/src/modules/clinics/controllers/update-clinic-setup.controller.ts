import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { Roles } from '@/infra/auth/roles.decorator';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, HttpCode, Patch } from '@nestjs/common';
import { prisma } from '@workspace/database';
import { z } from 'zod';
import { UpdateClinicSetupUseCase } from '../use-cases/update-clinic-setup.usecase';

const updateClinicSetupBodySchema = z.object({
  name: z.string().min(1),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email().optional(),
  businessHours: z.record(
    z.object({
      start: z.string(),
      end: z.string(),
      closed: z.boolean(),
    }),
  ),
  timezone: z.string(),
  averageAppointmentValue: z.number().positive().optional(),
});

type UpdateClinicSetupBody = z.infer<typeof updateClinicSetupBodySchema>;

@Controller('/clinics/setup')
export class UpdateClinicSetupController {
  constructor(private updateClinicSetup: UpdateClinicSetupUseCase) {}

  @Patch()
  @Roles('ADMIN')
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(updateClinicSetupBodySchema))
    body: UpdateClinicSetupBody,
  ) {
    const {
      name,
      contactPhone,
      contactEmail,
      businessHours,
      timezone,
      averageAppointmentValue,
    } = body;

    // Get user's clinic ID from database
    const currentUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { clinicId: true },
    });

    if (!currentUser) {
      throw new ResourceNotFoundError();
    }

    const { clinic } = await this.updateClinicSetup.execute({
      userId: user.sub,
      clinicId: currentUser.clinicId,
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
