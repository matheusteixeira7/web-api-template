import { z } from 'zod';
import type { Clinic } from '../entities/clinic.entity';

export const updateClinicSetupSchema = z.object({
  clinicId: z.string().uuid(),
  userId: z.string().uuid(),
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

export type UpdateClinicSetupInputDto = z.infer<typeof updateClinicSetupSchema>;

export interface UpdateClinicSetupResponseDto {
  clinic: Clinic;
}
