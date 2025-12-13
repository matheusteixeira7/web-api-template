import { z } from 'zod';
import type { User } from '../entities/user.entity';

/**
 * Zod schema for validating find user input.
 *
 * @property userId - The user's unique identifier
 */
export const findUserSchema = z.object({
  userId: z.string().min(1),
});

/** Inferred type from the find user schema */
export type FindUserInputDto = z.infer<typeof findUserSchema>;

/** User type with password field omitted for safe responses */
export type UserWithoutPassword = Omit<User, 'password'>;

/** Response DTO for finding a user containing the user without password */
export interface FindUserResponseDto {
  user: UserWithoutPassword;
}
