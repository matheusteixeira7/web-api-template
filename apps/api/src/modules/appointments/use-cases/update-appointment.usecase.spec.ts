import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Patient } from '../../patients/entities/patient.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { Appointment } from '../entities/appointment.entity';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { InMemoryBlockedTimeSlotsRepository } from '../repositories/in-memory-blocked-time-slots.repository';
import { BlockedTimeSlotError } from './errors/blocked-time-slot.error';
import { OutsideWorkingHoursError } from './errors/outside-working-hours.error';
import { ProviderNotAvailableError } from './errors/provider-not-available.error';
import { UpdateAppointmentUseCase } from './update-appointment.usecase';

describe('UpdateAppointmentUseCase', () => {
  let sut: UpdateAppointmentUseCase;
  let appointmentsRepository: InMemoryAppointmentsRepository;
  let blockedTimeSlotsRepository: InMemoryBlockedTimeSlotsRepository;
  let mockPatientsApi: {
    findById: jest.Mock;
    findByClinicId: jest.Mock;
    findByPhone: jest.Mock;
  };
  let mockProvidersApi: {
    findById: jest.Mock;
    findByClinicId: jest.Mock;
    findByUserId: jest.Mock;
  };

  const clinicId = 'clinic-123';
  const appointmentId = 'appointment-123';
  const patientId = 'patient-123';
  const providerId = 'provider-123';

  const mockPatient = new Patient({
    id: patientId,
    clinicId,
    name: 'John Doe',
    phone: '11999999999',
  });

  const mockProvider = new Provider({
    id: providerId,
    clinicId,
    name: 'Dr. Smith',
    specialty: 'General',
    workingHours: {
      '1': { start: '08:00', end: '18:00' },
      '2': { start: '08:00', end: '18:00' },
      '3': { start: '08:00', end: '18:00' },
      '4': { start: '08:00', end: '18:00' },
      '5': { start: '08:00', end: '18:00' },
    },
  });

  const createMockAppointment = (
    overrides: Partial<Appointment> = {},
  ): Appointment => {
    return new Appointment({
      id: appointmentId,
      clinicId,
      patientId,
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
    blockedTimeSlotsRepository = new InMemoryBlockedTimeSlotsRepository();

    mockPatientsApi = {
      findById: jest.fn(),
      findByClinicId: jest.fn(),
      findByPhone: jest.fn(),
    };

    mockProvidersApi = {
      findById: jest.fn(),
      findByClinicId: jest.fn(),
      findByUserId: jest.fn(),
    };

    sut = new UpdateAppointmentUseCase(
      appointmentsRepository,
      blockedTimeSlotsRepository,
      mockPatientsApi,
      mockProvidersApi,
    );
  });

  it('should update appointment notes successfully', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      appointmentId,
      clinicId,
      notes: 'Updated notes',
    });

    expect(result.appointment.notes).toBe('Updated notes');
  });

  it('should update patient successfully', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);

    const newPatient = new Patient({
      id: 'new-patient',
      clinicId,
      name: 'Jane Doe',
      phone: '11888888888',
    });

    mockPatientsApi.findById.mockResolvedValue(newPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      appointmentId,
      clinicId,
      patientId: 'new-patient',
    });

    expect(result.appointment.patientId).toBe('new-patient');
    expect(result.appointment.patientName).toBe('Jane Doe');
    expect(result.appointment.patientPhone).toBe('11888888888');
  });

  it('should update provider successfully', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);

    const newProvider = new Provider({
      id: 'new-provider',
      clinicId,
      name: 'Dr. Johnson',
      specialty: 'Cardiology',
      workingHours: {
        '1': { start: '08:00', end: '18:00' },
      },
    });

    mockProvidersApi.findById.mockResolvedValue(newProvider);

    const result = await sut.execute({
      appointmentId,
      clinicId,
      providerId: 'new-provider',
    });

    expect(result.appointment.providerId).toBe('new-provider');
    expect(result.appointment.providerName).toBe('Dr. Johnson');
  });

  it('should update appointment time successfully', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const newStart = new Date('2024-01-08T14:00:00');
    const newEnd = new Date('2024-01-08T14:30:00');

    const result = await sut.execute({
      appointmentId,
      clinicId,
      appointmentStart: newStart,
      appointmentEnd: newEnd,
    });

    expect(result.appointment.appointmentStart).toEqual(newStart);
    expect(result.appointment.appointmentEnd).toEqual(newEnd);
  });

  it('should throw ResourceNotFoundError if appointment not found', async () => {
    await expect(
      sut.execute({
        appointmentId: 'non-existent',
        clinicId,
        notes: 'Updated',
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
        notes: 'Updated',
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if new patient not found', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockPatientsApi.findById.mockResolvedValue(null);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        patientId: 'non-existent-patient',
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if new provider not found', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        providerId: 'non-existent-provider',
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if new provider belongs to different clinic', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(
      new Provider({
        ...mockProvider,
        id: 'new-provider',
        clinicId: 'different-clinic',
      }),
    );

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        providerId: 'new-provider',
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw OutsideWorkingHoursError when rescheduling outside working hours', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Sunday (day 0) - provider doesn't work
    const newStart = new Date('2024-01-07T10:00:00');
    const newEnd = new Date('2024-01-07T10:30:00');

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        appointmentStart: newStart,
        appointmentEnd: newEnd,
      }),
    ).rejects.toThrow(OutsideWorkingHoursError);
  });

  it('should throw BlockedTimeSlotError when rescheduling to blocked time', async () => {
    const appointment = createMockAppointment();
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const blockedSlot = new BlockedTimeSlot({
      providerId,
      startDatetime: new Date('2024-01-08T14:00:00'),
      endDatetime: new Date('2024-01-08T16:00:00'),
    });
    blockedTimeSlotsRepository.items.push(blockedSlot);

    const newStart = new Date('2024-01-08T14:30:00');
    const newEnd = new Date('2024-01-08T15:00:00');

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        appointmentStart: newStart,
        appointmentEnd: newEnd,
      }),
    ).rejects.toThrow(BlockedTimeSlotError);
  });

  it('should throw ProviderNotAvailableError when conflicting appointment exists', async () => {
    const appointment = createMockAppointment();
    const conflictingAppointment = createMockAppointment({
      id: 'other-appointment',
      appointmentStart: new Date('2024-01-08T14:00:00'),
      appointmentEnd: new Date('2024-01-08T14:30:00'),
    });
    appointmentsRepository.items.push(appointment, conflictingAppointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const newStart = new Date('2024-01-08T14:00:00');
    const newEnd = new Date('2024-01-08T14:30:00');

    await expect(
      sut.execute({
        appointmentId,
        clinicId,
        appointmentStart: newStart,
        appointmentEnd: newEnd,
      }),
    ).rejects.toThrow(ProviderNotAvailableError);
  });

  it('should allow updating location to null', async () => {
    const appointment = createMockAppointment({
      locationId: 'location-123',
    });
    appointmentsRepository.items.push(appointment);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      appointmentId,
      clinicId,
      locationId: null,
    });

    expect(result.appointment.locationId).toBeNull();
  });
});
