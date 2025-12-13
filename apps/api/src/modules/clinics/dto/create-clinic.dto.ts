import { z } from 'zod';

export const createClinicSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  timezone: z.string().optional(),
});

export type CreateClinicInputDto = z.infer<typeof createClinicSchema>;
