import { z } from 'zod';
import type { User } from '../entities/user.entity';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export type CreateUserInputDto = z.infer<typeof createUserSchema>;

export interface CreateUserResponseDto {
  user: User;
}
