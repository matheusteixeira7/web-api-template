import { z } from 'zod';

export const findClinicSchema = z.object({
  id: z.string().uuid(),
});

export type FindClinicInputDto = z.infer<typeof findClinicSchema>;
