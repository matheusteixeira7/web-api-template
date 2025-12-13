import { z } from 'zod';
import type { User } from '../entities/user.entity';

/**
 * Zod schema for validating user creation input.
 *
 * @property email - Valid email address
 * @property name - User's display name (min 1 character)
 * @property password - Password (min 6 characters)
 * @property clinicId - UUID of the clinic the user belongs to
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  clinicId: z.string().uuid(),
});

/** Inferred type from the create user schema */
export type CreateUserInputDto = z.infer<typeof createUserSchema>;

/** User type with password field omitted for safe responses */
export type UserWithoutPassword = Omit<User, 'password'>;

/** Response DTO for user creation containing the user without password */
export interface CreateUserResponseDto {
  user: UserWithoutPassword;
}
