import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { FindAppointmentsByProviderUseCase } from './find-appointments-by-provider.usecase';

describe('FindAppointmentsByProviderUseCase', () => {
  let sut: FindAppointmentsByProviderUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;

  const clinicId = 'clinic-123';
  const providerId = 'provider-123';

  const createMockAppointment = (
    overrides: Partial<Appointment> = {},
  ): Appointment => {
    return new Appointment({
      clinicId,
      patientId: 'patient-123',
      providerId,
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
    sut = new FindAppointmentsByProviderUseCase(appointmentsRepository);
  });

  it('should return paginated appointments for a provider', async () => {
    const appointment1 = createMockAppointment({ id: 'apt-1' });
    const appointment2 = createMockAppointment({ id: 'apt-2' });
    appointmentsRepository.items.push(appointment1, appointment2);

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.appointments).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('should return empty results if no appointments found', async () => {
    const result = await sut.execute({
      providerId,
      clinicId,
    });

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

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-1');
  });

  it('should apply pagination correctly', async () => {
    // Add 15 appointments
    for (let i = 0; i < 15; i++) {
      appointmentsRepository.items.push(
        createMockAppointment({ id: `apt-${i}` }),
      );
    }

    const result = await sut.execute({
      providerId,
      clinicId,
      page: 2,
      perPage: 5,
    });

    expect(result.appointments).toHaveLength(5);
    expect(result.total).toBe(15);
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(5);
    expect(result.totalPages).toBe(3);
  });

  it('should filter by status', async () => {
    const scheduled = createMockAppointment({
      id: 'apt-1',
      status: 'SCHEDULED',
    });
    const completed = createMockAppointment({
      id: 'apt-2',
      status: 'COMPLETED',
    });
    appointmentsRepository.items.push(scheduled, completed);

    const result = await sut.execute({
      providerId,
      clinicId,
      status: 'SCHEDULED',
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].status).toBe('SCHEDULED');
  });

  it('should filter by date range', async () => {
    const earlyAppointment = createMockAppointment({
      id: 'apt-1',
      appointmentStart: new Date('2024-01-01T10:00:00'),
    });
    const lateAppointment = createMockAppointment({
      id: 'apt-2',
      appointmentStart: new Date('2024-01-15T10:00:00'),
    });
    appointmentsRepository.items.push(earlyAppointment, lateAppointment);

    const result = await sut.execute({
      providerId,
      clinicId,
      startDate: new Date('2024-01-10T00:00:00'),
      endDate: new Date('2024-01-20T00:00:00'),
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-2');
  });

  it('should not return soft-deleted appointments', async () => {
    const activeAppointment = createMockAppointment({ id: 'apt-1' });
    const deletedAppointment = createMockAppointment({
      id: 'apt-2',
      deletedAt: new Date(),
    });
    appointmentsRepository.items.push(activeAppointment, deletedAppointment);

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].id).toBe('apt-1');
  });

  it('should sort by appointmentStart in ascending order by default', async () => {
    const laterAppointment = createMockAppointment({
      id: 'apt-1',
      appointmentStart: new Date('2024-01-10T10:00:00'),
    });
    const earlierAppointment = createMockAppointment({
      id: 'apt-2',
      appointmentStart: new Date('2024-01-05T10:00:00'),
    });
    appointmentsRepository.items.push(laterAppointment, earlierAppointment);

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.appointments[0].id).toBe('apt-2');
    expect(result.appointments[1].id).toBe('apt-1');
  });

  it('should sort in descending order when specified', async () => {
    const laterAppointment = createMockAppointment({
      id: 'apt-1',
      appointmentStart: new Date('2024-01-10T10:00:00'),
    });
    const earlierAppointment = createMockAppointment({
      id: 'apt-2',
      appointmentStart: new Date('2024-01-05T10:00:00'),
    });
    appointmentsRepository.items.push(laterAppointment, earlierAppointment);

    const result = await sut.execute({
      providerId,
      clinicId,
      sortDir: 'desc',
    });

    expect(result.appointments[0].id).toBe('apt-1');
    expect(result.appointments[1].id).toBe('apt-2');
  });
});
