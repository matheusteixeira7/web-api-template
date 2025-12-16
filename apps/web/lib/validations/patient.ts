import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";

/**
 * Document type schema.
 */
export const documentTypeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
});

/**
 * Patient document schema.
 */
export const patientDocumentSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  documentTypeId: z.string().uuid(),
  value: z.string(),
  documentType: documentTypeSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PatientDocument = z.infer<typeof patientDocumentSchema>;

/**
 * Patient entity type (matches backend).
 */
export const patientSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  medicalRecordId: z.string().nullable(),
  notes: z.string().nullable(),
  documents: z.array(patientDocumentSchema).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Patient = z.infer<typeof patientSchema>;

/**
 * Create patient form schema.
 */
export const createPatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .min(10, "Telefone invalido")
    .regex(/^[\d\s()+-]+$/, "Telefone deve conter apenas numeros"),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  medicalRecordId: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000, "Observacoes muito longas").optional(),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => !v || cpf.isValid(v), { message: "CPF invalido" })
    .optional()
    .or(z.literal("")),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

/**
 * Update patient form schema.
 */
export const updatePatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  phone: z
    .string()
    .min(10, "Telefone invalido")
    .regex(/^[\d\s()+-]+$/, "Telefone deve conter apenas numeros")
    .optional(),
  email: z.string().email("Email invalido").nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  medicalRecordId: z.string().nullable().optional(),
  notes: z.string().max(1000, "Observacoes muito longas").nullable().optional(),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => !v || cpf.isValid(v), { message: "CPF invalido" })
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

/**
 * API response type for paginated patients list.
 */
export interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * API response type for single patient.
 */
export interface PatientResponse {
  patient: Patient;
}

/**
 * Query params for fetching patients.
 */
export interface PatientsQueryParams {
  search?: string;
  sortBy?: "name" | "phone" | "email" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  perPage?: number;
}
