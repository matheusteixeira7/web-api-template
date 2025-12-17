import { Appointment } from '../entities/appointment.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { FindAppointmentsByClinicUseCase } from './find-appointments-by-clinic.usecase';

describe('FindAppointmentsByClinicUseCase', () => {
  let sut: FindAppointmentsByClinicUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;

  const clinicId = 'clinic-123';

  const createAppointment = (
    overrides: Partial<{
      id: string;
      clinicId: string;
      status: Appointment['status'];
      appointmentStart: Date;
      providerId: string;
      patientId: string;
    }> = {},
  ) => {
    return new Appointment({
      id: overrides.id ?? `appointment-${Date.now()}-${Math.random()}`,
      clinicId: overrides.clinicId ?? clinicId,
      patientId: overrides.patientId ?? 'patient-123',
      providerId: overrides.providerId ?? 'provider-123',
      appointmentStart:
        overrides.appointmentStart ?? new Date('2024-01-08T10:00:00'),
      appointmentEnd: new Date(
        (
          overrides.appointmentStart ?? new Date('2024-01-08T10:00:00')
        ).getTime() +
          30 * 60 * 1000,
      ),
      patientName: 'John Doe',
      patientPhone: '11999999999',
      providerName: 'Dr. Smith',
      status: overrides.status ?? 'SCHEDULED',
    });
  };

  beforeEach(() => {
    appointmentsRepository = new InMemoryAppointmentsRepository();
    sut = new FindAppointmentsByClinicUseCase(appointmentsRepository);
  });

  it('should return appointments for a clinic', async () => {
    appointmentsRepository.items.push(createAppointment());
    appointmentsRepository.items.push(createAppointment());
    appointmentsRepository.items.push(
      createAppointment({ clinicId: 'other-clinic' }),
    );

    const result = await sut.execute({ clinicId });

    expect(result.appointments).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should filter by status', async () => {
    appointmentsRepository.items.push(
      createAppointment({ status: 'SCHEDULED' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ status: 'CONFIRMED' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ status: 'COMPLETED' }),
    );

    const result = await sut.execute({
      clinicId,
      status: 'CONFIRMED',
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].status).toBe('CONFIRMED');
  });

  it('should filter by date range', async () => {
    appointmentsRepository.items.push(
      createAppointment({ appointmentStart: new Date('2024-01-01T10:00:00') }),
    );
    appointmentsRepository.items.push(
      createAppointment({ appointmentStart: new Date('2024-01-15T10:00:00') }),
    );
    appointmentsRepository.items.push(
      createAppointment({ appointmentStart: new Date('2024-01-31T10:00:00') }),
    );

    const result = await sut.execute({
      clinicId,
      startDate: new Date('2024-01-10T00:00:00'),
      endDate: new Date('2024-01-20T23:59:59'),
    });

    expect(result.appointments).toHaveLength(1);
  });

  it('should filter by provider', async () => {
    appointmentsRepository.items.push(
      createAppointment({ providerId: 'provider-1' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ providerId: 'provider-2' }),
    );

    const result = await sut.execute({
      clinicId,
      providerId: 'provider-1',
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].providerId).toBe('provider-1');
  });

  it('should filter by patient', async () => {
    appointmentsRepository.items.push(
      createAppointment({ patientId: 'patient-1' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ patientId: 'patient-2' }),
    );

    const result = await sut.execute({
      clinicId,
      patientId: 'patient-1',
    });

    expect(result.appointments).toHaveLength(1);
    expect(result.appointments[0].patientId).toBe('patient-1');
  });

  it('should paginate results', async () => {
    // Create 15 appointments
    for (let i = 0; i < 15; i++) {
      appointmentsRepository.items.push(
        createAppointment({ id: `appointment-${i}` }),
      );
    }

    const page1 = await sut.execute({
      clinicId,
      page: 1,
      perPage: 10,
    });

    const page2 = await sut.execute({
      clinicId,
      page: 2,
      perPage: 10,
    });

    expect(page1.appointments).toHaveLength(10);
    expect(page1.total).toBe(15);
    expect(page1.totalPages).toBe(2);
    expect(page2.appointments).toHaveLength(5);
  });

  it('should apply default pagination', async () => {
    for (let i = 0; i < 20; i++) {
      appointmentsRepository.items.push(createAppointment());
    }

    const result = await sut.execute({ clinicId });

    expect(result.page).toBe(1);
    expect(result.perPage).toBe(10);
    expect(result.appointments).toHaveLength(10);
  });

  it('should exclude deleted appointments', async () => {
    const appointment1 = createAppointment();
    const appointment2 = createAppointment();
    appointment2.deletedAt = new Date();

    appointmentsRepository.items.push(appointment1);
    appointmentsRepository.items.push(appointment2);

    const result = await sut.execute({ clinicId });

    expect(result.appointments).toHaveLength(1);
  });

  it('should return all statuses when status filter is "all"', async () => {
    appointmentsRepository.items.push(
      createAppointment({ status: 'SCHEDULED' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ status: 'CONFIRMED' }),
    );
    appointmentsRepository.items.push(
      createAppointment({ status: 'COMPLETED' }),
    );

    const result = await sut.execute({
      clinicId,
      status: 'all',
    });

    expect(result.appointments).toHaveLength(3);
  });
});
