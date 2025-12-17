import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Patient } from '../../patients/entities/patient.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { InMemoryAppointmentsRepository } from '../repositories/in-memory-appointments.repository';
import { InMemoryBlockedTimeSlotsRepository } from '../repositories/in-memory-blocked-time-slots.repository';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import { CreateAppointmentUseCase } from './create-appointment.usecase';
import { BlockedTimeSlotError } from './errors/blocked-time-slot.error';
import { OutsideWorkingHoursError } from './errors/outside-working-hours.error';
import { ProviderNotAvailableError } from './errors/provider-not-available.error';
import { Appointment } from '../entities/appointment.entity';

describe('CreateAppointmentUseCase', () => {
  let sut: CreateAppointmentUseCase;
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
      '1': { start: '08:00', end: '18:00' }, // Monday
      '2': { start: '08:00', end: '18:00' }, // Tuesday
      '3': { start: '08:00', end: '18:00' }, // Wednesday
      '4': { start: '08:00', end: '18:00' }, // Thursday
      '5': { start: '08:00', end: '18:00' }, // Friday
    },
  });

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

    sut = new CreateAppointmentUseCase(
      appointmentsRepository,
      blockedTimeSlotsRepository,
      mockPatientsApi,
      mockProvidersApi,
    );
  });

  it('should create an appointment successfully', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Monday at 10:00 AM
    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    const result = await sut.execute({
      clinicId,
      patientId,
      providerId,
      appointmentStart,
      appointmentEnd,
      bookingSource: 'MANUAL',
    });

    expect(result.appointment).toBeDefined();
    expect(result.appointment.clinicId).toBe(clinicId);
    expect(result.appointment.patientId).toBe(patientId);
    expect(result.appointment.providerId).toBe(providerId);
    expect(result.appointment.status).toBe('SCHEDULED');
    expect(result.appointment.patientName).toBe(mockPatient.name);
    expect(result.appointment.patientPhone).toBe(mockPatient.phone);
    expect(result.appointment.providerName).toBe(mockProvider.name);
    expect(appointmentsRepository.items).toHaveLength(1);
    expect(appointmentsRepository.statusEvents).toHaveLength(1);
  });

  it('should throw ResourceNotFoundError if patient not found', async () => {
    mockPatientsApi.findById.mockResolvedValue(null);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if provider not found', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(null);

    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if provider belongs to different clinic', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(
      new Provider({
        ...mockProvider,
        clinicId: 'different-clinic',
      }),
    );

    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw OutsideWorkingHoursError if outside provider working hours', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Sunday (day 0) - provider doesn't work
    const appointmentStart = new Date('2024-01-07T10:00:00');
    const appointmentEnd = new Date('2024-01-07T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(OutsideWorkingHoursError);
  });

  it('should throw OutsideWorkingHoursError if appointment time is too early', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Monday at 7:00 AM - before working hours
    const appointmentStart = new Date('2024-01-08T07:00:00');
    const appointmentEnd = new Date('2024-01-08T07:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(OutsideWorkingHoursError);
  });

  it('should throw BlockedTimeSlotError if blocked time slot exists', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Add blocked time slot
    const blockedSlot = new BlockedTimeSlot({
      providerId,
      startDatetime: new Date('2024-01-08T09:00:00'),
      endDatetime: new Date('2024-01-08T12:00:00'),
      reason: 'Meeting',
    });
    blockedTimeSlotsRepository.items.push(blockedSlot);

    // Try to schedule during blocked time
    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(BlockedTimeSlotError);
  });

  it('should throw ProviderNotAvailableError if conflicting appointment exists', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    // Add existing appointment
    const existingAppointment = new Appointment({
      clinicId,
      patientId: 'other-patient',
      providerId,
      appointmentStart: new Date('2024-01-08T10:00:00'),
      appointmentEnd: new Date('2024-01-08T10:30:00'),
      patientName: 'Other Patient',
      patientPhone: '11888888888',
      providerName: mockProvider.name,
    });
    appointmentsRepository.items.push(existingAppointment);

    // Try to schedule at the same time
    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    await expect(
      sut.execute({
        clinicId,
        patientId,
        providerId,
        appointmentStart,
        appointmentEnd,
      }),
    ).rejects.toThrow(ProviderNotAvailableError);
  });

  it('should allow appointment if provider has no working hours defined', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(
      new Provider({
        ...mockProvider,
        workingHours: null,
      }),
    );

    // Any time should work
    const appointmentStart = new Date('2024-01-07T03:00:00'); // Sunday at 3 AM
    const appointmentEnd = new Date('2024-01-07T03:30:00');

    const result = await sut.execute({
      clinicId,
      patientId,
      providerId,
      appointmentStart,
      appointmentEnd,
    });

    expect(result.appointment).toBeDefined();
  });

  it('should create status event with appointment creation', async () => {
    mockPatientsApi.findById.mockResolvedValue(mockPatient);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const appointmentStart = new Date('2024-01-08T10:00:00');
    const appointmentEnd = new Date('2024-01-08T10:30:00');

    const result = await sut.execute({
      clinicId,
      patientId,
      providerId,
      appointmentStart,
      appointmentEnd,
      createdById: 'user-123',
    });

    expect(appointmentsRepository.statusEvents).toHaveLength(1);
    expect(appointmentsRepository.statusEvents[0].appointmentId).toBe(
      result.appointment.id,
    );
    expect(appointmentsRepository.statusEvents[0].previousStatus).toBeNull();
    expect(appointmentsRepository.statusEvents[0].newStatus).toBe('SCHEDULED');
    expect(appointmentsRepository.statusEvents[0].changedById).toBe('user-123');
  });
});
