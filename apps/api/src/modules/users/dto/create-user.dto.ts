import { z } from 'zod';
import type { User } from '../entities/user.entity';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export type CreateUserInputDto = z.infer<typeof createUserSchema>;

export type UserWithoutPassword = Omit<User, 'password'>;

export interface CreateUserResponseDto {
  user: UserWithoutPassword;
}
