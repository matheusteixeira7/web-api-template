import { z } from 'zod';
import { cpf } from 'cpf-cnpj-validator';
import type { Patient } from '../entities/patient.entity';

/**
 * Zod schema for validating the create patient HTTP request body.
 *
 * @property name - Patient's full name (min 1 character)
 * @property phone - Patient's WhatsApp phone number
 * @property email - Optional email address
 * @property dateOfBirth - Optional date of birth (ISO date string)
 * @property medicalRecordId - Optional clinic internal medical record ID
 * @property notes - Optional additional notes
 * @property cpf - Optional CPF (validated and normalized to digits only)
 */
export const createPatientBodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  dateOfBirth: z.coerce.date().optional(),
  medicalRecordId: z.string().optional(),
  notes: z.string().optional(),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => !v || cpf.isValid(v), { message: 'CPF invalido' })
    .optional(),
});

/** Inferred type from the create patient body schema */
export type CreatePatientBodyDto = z.infer<typeof createPatientBodySchema>;

/**
 * Zod schema for the use case input, extending body schema with clinic context.
 *
 * @property clinicId - The clinic's unique identifier
 */
export const createPatientSchema = createPatientBodySchema.extend({
  clinicId: z.string().uuid(),
});

/** Inferred type from the create patient schema */
export type CreatePatientInputDto = z.infer<typeof createPatientSchema>;

/** Response DTO containing the created patient entity */
export interface CreatePatientResponseDto {
  patient: Patient;
}
