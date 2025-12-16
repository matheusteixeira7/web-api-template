import { cpf } from "cpf-cnpj-validator";

/**
 * Applies CPF mask to a string (000.000.000-00).
 */
export function applyCpfMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Formats a CPF value for display (000.000.000-00).
 */
export function formatCpf(value: string): string {
  return cpf.format(value);
}

/**
 * Removes formatting from a CPF (returns digits only).
 */
export function normalizeCpf(value: string): string {
  return cpf.strip(value);
}

/**
 * Validates a CPF value.
 */
export function validateCpf(value: string): boolean {
  return cpf.isValid(value);
}

/**
 * Document type with value.
 */
export interface PatientDocumentData {
  documentType: {
    code: string;
    name: string;
  };
  value: string;
}

/**
 * Gets the CPF from a patient's documents array.
 */
export function getCpfFromDocuments(
  documents: PatientDocumentData[]
): string | null {
  const cpfDoc = documents.find((d) => d.documentType.code === "CPF");
  return cpfDoc?.value ?? null;
}

/**
 * Gets the formatted CPF from a patient's documents array.
 */
export function getFormattedCpfFromDocuments(
  documents: PatientDocumentData[]
): string | null {
  const cpfValue = getCpfFromDocuments(documents);
  return cpfValue ? formatCpf(cpfValue) : null;
}
