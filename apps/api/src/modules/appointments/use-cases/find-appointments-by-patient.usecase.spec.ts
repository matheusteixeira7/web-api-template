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

    const result = await sut.execute({ patientId, clinicId });

    expect(result.appointments).toHaveLength(2);
    expect(result.appointments[0].patientId).toBe(patientId);
    expect(result.appointments[1].patientId).toBe(patientId);
    expect(result.total).toBe(2);
  });

  it('should return empty array if no appointments found', async () => {
    const result = await sut.execute({ patientId, clinicId });

    expect(result.appointments).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should only return appointments from the specified clinic', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      clinicId: 'different-clinic',
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute({ patientId, clinicId });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-1');
    expect(result.total).toBe(1);
  });

  it('should not return soft-deleted appointments', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      deletedAt: new Date(),
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute({ patientId, clinicId });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-1');
    expect(result.total).toBe(1);
  });

  it('should only return appointments for the specified patient', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({
      id: 'apt-2',
      patientId: 'different-patient',
    });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute({ patientId, clinicId });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-1');
    expect(result.total).toBe(1);
  });

  it('should support pagination', async () => {
    // Create 15 appointments
    for (let i = 0; i < 15; i++) {
      appointmentsRepository.items.push(
        createMockAppointment({
          id: `apt-${i}`,
          appointmentStart: new Date(
            `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00`,
          ),
        }),
      );
    }

    const page1 = await sut.execute({
      patientId,
      clinicId,
      page: 1,
      perPage: 10,
    });
    const page2 = await sut.execute({
      patientId,
      clinicId,
      page: 2,
      perPage: 10,
    });

    expect(page1.appointments).toHaveLength(10);
    expect(page1.total).toBe(15);
    expect(page1.page).toBe(1);
    expect(page1.perPage).toBe(10);
    expect(page1.totalPages).toBe(2);

    expect(page2.appointments).toHaveLength(5);
    expect(page2.total).toBe(15);
    expect(page2.page).toBe(2);
  });

  it('should filter by status', async () => {
    const scheduled = createMockAppointment({
      id: 'apt-1',
      status: 'SCHEDULED',
    });
    const confirmed = createMockAppointment({
      id: 'apt-2',
      status: 'CONFIRMED',
    });
    appointmentsRepository.items.push(scheduled, confirmed);

    const result = await sut.execute({
      patientId,
      clinicId,
      status: 'CONFIRMED',
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-2');
  });

  it('should filter by date range', async () => {
    const jan = createMockAppointment({
      id: 'apt-1',
      appointmentStart: new Date('2024-01-15T10:00:00'),
    });
    const feb = createMockAppointment({
      id: 'apt-2',
      appointmentStart: new Date('2024-02-15T10:00:00'),
    });
    appointmentsRepository.items.push(jan, feb);

    const result = await sut.execute({
      patientId,
      clinicId,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-2');
  });
});
