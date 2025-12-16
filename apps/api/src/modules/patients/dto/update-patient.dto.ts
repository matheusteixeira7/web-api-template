import { z } from 'zod';
import { cpf } from 'cpf-cnpj-validator';
import type { Patient } from '../entities/patient.entity';

/**
 * Zod schema for validating the update patient HTTP request body.
 * All fields are optional for partial updates.
 *
 * @property name - Patient's full name (min 1 character)
 * @property phone - Patient's WhatsApp phone number
 * @property email - Email address (can be set to null)
 * @property dateOfBirth - Date of birth (can be set to null)
 * @property medicalRecordId - Clinic internal medical record ID (can be set to null)
 * @property notes - Additional notes (can be set to null)
 * @property cpf - CPF (validated and normalized to digits only, can be set to null)
 */
export const updatePatientBodySchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  medicalRecordId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  cpf: z
    .union([
      z.null(),
      z
        .string()
        .transform((v) => v.replace(/\D/g, ''))
        .refine((v) => !v || cpf.isValid(v), { message: 'CPF invalido' }),
    ])
    .optional(),
});

/** Inferred type from the update patient body schema */
export type UpdatePatientBodyDto = z.infer<typeof updatePatientBodySchema>;

/**
 * Zod schema for the use case input, extending body schema with identifiers.
 *
 * @property patientId - The patient's unique identifier
 * @property clinicId - The clinic's unique identifier (for authorization)
 */
export const updatePatientSchema = updatePatientBodySchema.extend({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
});

/** Inferred type from the update patient schema */
export type UpdatePatientInputDto = z.infer<typeof updatePatientSchema>;

/** Response DTO containing the updated patient entity */
export interface UpdatePatientResponseDto {
  patient: Patient;
}
