import { z } from 'zod';

/**
 * Zod schema for validating email verification input.
 *
 * @property userId - UUID of the user to verify
 */
export const verifyEmailSchema = z.object({
  userId: z.string().uuid(),
});

/** Inferred type from the verify email schema */
export type VerifyEmailInputDto = z.infer<typeof verifyEmailSchema>;
