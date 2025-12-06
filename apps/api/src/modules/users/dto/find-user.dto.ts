import { z } from 'zod';
import type { User } from '../entities/user.entity';

export const findUserSchema = z.object({
  userId: z.string().min(1),
});

export type FindUserInputDto = z.infer<typeof findUserSchema>;

export interface FindUserResponseDto {
  user: User;
}
