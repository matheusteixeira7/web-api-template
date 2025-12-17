import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { FindAppointmentsByPatientUseCase } from './find-appointments-by-patient.usecase';

describe('FindAppointmentsByPatientUseCase', () => {
  let sut: FindAppointmentsByPatientUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;

  const clinicId = 'clinic-123';
  const patientId = 'patient-123';

  const createMockAppointment = (
    overrides: Partial<Appointment> = {},
  ): Appointment => {
    return new Appointment({
      clinicId,
      patientId,
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
    sut = new FindAppointmentsByPatientUseCase(appointmentsRepository);
  });

  it('should return appointments for a patient', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({ id: 'apt-2' });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute(patientId, clinicId);

    expect(result).toHaveLength(2);
    expect(result[0].patientId).toBe(patientId);
    expect(result[1].patientId).toBe(patientId);
  });

  it('should return empty array if no appointments found', async () => {
    const result = await sut.execute(patientId, clinicId);

    expect(result).toHaveLength(0);
  });

  it('should only return appointments from the specified clinic', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      clinicId: 'different-clinic',
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute(patientId, clinicId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('apt-1');
  });

  it('should not return soft-deleted appointments', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      deletedAt: new Date(),
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute(patientId, clinicId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('apt-1');
  });

  it('should only return appointments for the specified patient', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      patientId: 'different-patient',
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute(patientId, clinicId);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('apt-1');
  });
});
