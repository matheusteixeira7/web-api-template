import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition.error';
import { UpdateAppointmentStatusUseCase } from './update-appointment-status.usecase';

describe('UpdateAppointmentStatusUseCase', () => {
  let sut: UpdateAppointmentStatusUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;

  const clinicId = 'clinic-123';
  const appointmentId = 'appointment-123';

  const createAppointment = (status: Appointment['status'] = 'SCHEDULED') => {
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
      status,
    });
  };

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    sut = new UpdateAppointmentStatusUseCase(appointmentsRepository);
  });

  it('should update status from SCHEDULED to CONFIRMED', async () => {
    appointmentsRepository.items.push(createAppointment('SCHEDULED'));

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'CONFIRMED',
      changedById: 'user-123',
    });

    expect(result.appointment.status).toBe('CONFIRMED');
    expect(result.previousStatus).toBe('SCHEDULED');
    expect(result.appointment.confirmedAt).toBeDefined();
    expect(appointmentsRepository.statusEvents).toHaveLength(1);
  });

  it('should update status from CONFIRMED to CHECKED_IN', async () => {
    appointmentsRepository.items.push(createAppointment('CONFIRMED'));

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'CHECKED_IN',
    });

    expect(result.appointment.status).toBe('CHECKED_IN');
    expect(result.previousStatus).toBe('CONFIRMED');
    expect(result.appointment.checkedInAt).toBeDefined();
  });

  it('should update status from CHECKED_IN to COMPLETED', async () => {
    appointmentsRepository.items.push(createAppointment('CHECKED_IN'));

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'COMPLETED',
    });

    expect(result.appointment.status).toBe('COMPLETED');
    expect(result.previousStatus).toBe('CHECKED_IN');
  });

  it('should update status from SCHEDULED to CANCELLED', async () => {
    appointmentsRepository.items.push(createAppointment('SCHEDULED'));

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'CANCELLED',
    });

    expect(result.appointment.status).toBe('CANCELLED');
    expect(result.previousStatus).toBe('SCHEDULED');
  });

  it('should update status from CONFIRMED to NO_SHOW', async () => {
    appointmentsRepository.items.push(createAppointment('CONFIRMED'));

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'NO_SHOW',
    });

    expect(result.appointment.status).toBe('NO_SHOW');
    expect(result.previousStatus).toBe('CONFIRMED');
  });

  it('should throw ResourceNotFoundError if appointment not found', async () => {
    await expect(
      sut.execute({
        appointmentId: 'non-existent',
        clinicId,
        status: 'CONFIRMED',
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw InvalidStatusTransitionError for invalid transition', async () => {
    appointmentsRepository.items.push(createAppointment('COMPLETED'));

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        status: 'SCHEDULED',
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw InvalidStatusTransitionError when trying to cancel a completed appointment', async () => {
    appointmentsRepository.items.push(createAppointment('COMPLETED'));

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        status: 'CANCELLED',
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should throw InvalidStatusTransitionError when trying to check in a scheduled appointment', async () => {
    appointmentsRepository.items.push(createAppointment('SCHEDULED'));

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        status: 'CHECKED_IN',
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  it('should create status event with notes', async () => {
    appointmentsRepository.items.push(createAppointment('SCHEDULED'));

    await sut.execute({
      appointmentId,
      clinicId,
      status: 'CONFIRMED',
      notes: 'Patient confirmed via phone',
      changedById: 'user-123',
    });

    expect(appointmentsRepository.statusEvents[0].notes).toBe(
      'Patient confirmed via phone',
    );
    expect(appointmentsRepository.statusEvents[0].changedById).toBe('user-123');
  });

  it('should not update confirmedAt if already set', async () => {
    const appointment = createAppointment('SCHEDULED');
    const originalConfirmedAt = new Date('2024-01-07T10:00:00');
    appointment.confirmedAt = originalConfirmedAt;
    appointmentsRepository.items.push(appointment);

    // First change to CONFIRMED (already has confirmedAt)
    appointment.status = 'CONFIRMED';

    const result = await sut.execute({
      appointmentId,
      clinicId,
      status: 'CHECKED_IN',
    });

    expect(result.appointment.confirmedAt).toEqual(originalConfirmedAt);
  });
});
