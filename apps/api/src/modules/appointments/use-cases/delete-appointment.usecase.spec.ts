import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { DeleteAppointmentUseCase } from './delete-appointment.usecase';

describe('DeleteAppointmentUseCase', () => {
  let sut: DeleteAppointmentUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;

  const clinicId = 'clinic-123';
  const appointmentId = 'appointment-123';

  const createMockAppointment = (
    overrides: Partial<Appointment> = {},
  ): Appointment => {
    return new Appointment({
      id: appointmentId,
      clinicId,
      patientId: 'patient-123',
      providerId: 'provider-123',
      appointmentStart: new Date('2024-01-08T10:00:00'),
      appointmentEnd: new Date('2024-01-08T10:30:00'),
      patientName: 'John Doe',
      patientPhone: '11999999999',
      providerName: 'Dr. Smith',
      ...overrides,
    });
  };

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    sut = new DeleteAppointmentUseCase(appointmentsRepository);
  });

  it('should soft delete an appointment successfully', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);

    await sut.execute({
      appointmentId,
      clinicId,
    });

    expect(appointmentsRepository.items[0].deletedAt).toBeDefined();
    expect(appointmentsRepository.items[0].deletedAt).toBeInstanceOf(Date);
  });

  it('should throw ResourceNotFoundError if appointment not found', async () => {
    await expect(
      sut.execute({
        appointmentId: 'non-existent',
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if appointment belongs to different clinic', async () => {
    const appointment = createMockAppointment({
      clinicId: 'different-clinic',
    });
    appointmentsRepository.items.push(appointment);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should not find already soft-deleted appointment', async () => {
    const appointment = createMockAppointment({
      deletedAt: new Date(),
    });
    appointmentsRepository.items.push(appointment);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });
});
