import { ResourceNotFoundError } from '@/shared/errors/resource-not-found-error';
import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@workspace/database';
import type {
  UpdatePatientInputDto,
  UpdatePatientResponseDto,
} from '../dto/update-patient.dto';
import { PatientsRepository } from '../repositories/patients.repository';

/**
 * Use case for updating an existing patient.
 *
 * @remarks
 * Updates only the fields provided in the input.
 * Validates that the patient exists and belongs to the specified clinic.
 * Handles CPF document updates if provided.
 */
@Injectable()
export class UpdatePatientUseCase {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  /**
   * Updates an existing patient.
   *
   * @param input - The patient update data including identifiers
   * @returns The updated patient wrapped in response DTO
   * @throws {ResourceNotFoundError} If the patient is not found
   * @throws {ForbiddenException} If the patient doesn't belong to the clinic
   * @throws {ConflictException} If CPF already exists for another patient in the clinic
   */
  async execute(
    input: UpdatePatientInputDto,
  ): Promise<UpdatePatientResponseDto> {
    const { patientId, clinicId, cpf, ...updateData } = input;

    const patient = await this.patientsRepository.findById(patientId, clinicId);

    if (!patient) {
      throw new ResourceNotFoundError();
    }

    // Update only provided fields
    if (updateData.name !== undefined) {
      patient.name = updateData.name;
    }
    if (updateData.phone !== undefined) {
      patient.phone = updateData.phone;
    }
    if (updateData.email !== undefined) {
      patient.email = updateData.email;
    }
    if (updateData.dateOfBirth !== undefined) {
      patient.dateOfBirth = updateData.dateOfBirth;
    }
    if (updateData.medicalRecordId !== undefined) {
      patient.medicalRecordId = updateData.medicalRecordId;
    }
    if (updateData.notes !== undefined) {
      patient.notes = updateData.notes;
    }

    const updatedPatient = await this.patientsRepository.save(patient);

    // Update CPF document if provided (including null to remove)
    if (cpf !== undefined) {
      try {
        await this.patientsRepository.upsertCpfDocument(
          patientId,
          clinicId,
          cpf,
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'Ja existe um paciente com este CPF nesta clinica',
          );
        }
        throw error;
      }

      // Refetch patient with updated documents
      const patientWithDocs = await this.patientsRepository.findById(
        patientId,
        clinicId,
      );
      return { patient: patientWithDocs };
    }

    return { patient: updatedPatient };
  }
}
