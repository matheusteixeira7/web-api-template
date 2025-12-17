import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { CancelAppointmentUseCase } from './cancel-appointment.usecase';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error';

describe('CancelAppointmentUseCase', () => {
  let sut: CancelAppointmentUseCase;
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
      status: 'SCHEDULED',
      ...overrides,
    });
  };

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    sut = new CancelAppointmentUseCase(appointmentsRepository);
  });

  it('should cancel a scheduled appointment successfully', async () => {
    const appointment = createMockAppointment({ status: 'SCHEDULED' });
    appointmentsRepository.items.push(appointment);

    const result = await sut.execute({
      appointmentId,
      clinicId,
      cancelledById: 'user-123',
    });

    expect(result.appointment).toBeDefined();
    expect(result.appointment.status).toBe('CANCELLED');
    expect(appointmentsRepository.statusEvents).toHaveLength(1);
    expect(appointmentsRepository.statusEvents[0].previousStatus).toBe(
      'SCHEDULED',
    );
    expect(appointmentsRepository.statusEvents[0].newStatus).toBe('CANCELLED');
  });

  it('should cancel a confirmed appointment successfully', async () => {
    const appointment = createMockAppointment({ status: 'CONFIRMED' });
    appointmentsRepository.items.push(appointment);

    const result = await sut.execute({
      appointmentId,
      clinicId,
    });

    expect(result.appointment.status).toBe('CANCELLED');
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

  it('should throw InvalidStatusTransitionError if appointment is already completed', async () => {
    const appointment = createMockAppointment({ status: 'COMPLETED' });
    appointmentsRepository.items.push(appointment);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw InvalidStatusTransitionError if appointment is already cancelled', async () => {
    const appointment = createMockAppointment({ status: 'CANCELLED' });
    appointmentsRepository.items.push(appointment);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw InvalidStatusTransitionError if appointment is checked in', async () => {
    const appointment = createMockAppointment({ status: 'CHECKED_IN' });
    appointmentsRepository.items.push(appointment);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should include notes in status event when provided', async () => {
    const appointment = createMockAppointment({ status: 'SCHEDULED' });
    appointmentsRepository.items.push(appointment);

    await sut.execute({
      appointmentId,
      clinicId,
      notes: 'Patient requested cancellation',
    });

    expect(appointmentsRepository.statusEvents[0].notes).toBe(
      'Patient requested cancellation',
    );
  });
});
