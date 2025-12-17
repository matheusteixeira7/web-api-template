import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Provider } from '../../providers/entities/provider.entity';
import { InMemoryBlockedTimeSlotsRepository } from '../repositories/in-memory-blocked-time-slots.repository';
import { CreateBlockedTimeSlotUseCase } from './create-blocked-time-slot.usecase';

describe('CreateBlockedTimeSlotUseCase', () => {
  let sut: CreateBlockedTimeSlotUseCase;
  let blockedTimeSlotsRepository: InMemoryBlockedTimeSlotsRepository;
  let mockProvidersApi: {
    findById: jest.Mock;
    findByClinicId: jest.Mock;
    findByUserId: jest.Mock;
  };

  const clinicId = 'clinic-123';
  const providerId = 'provider-123';

  const mockProvider = new Provider({
    id: providerId,
    clinicId,
    name: 'Dr. Smith',
  });

  beforeEach(() => {
    blockedTimeSlotsRepository = new InMemoryBlockedTimeSlotsRepository();

    mockProvidersApi = {
      findById: jest.fn(),
      findByClinicId: jest.fn(),
      findByUserId: jest.fn(),
    };

    sut = new CreateBlockedTimeSlotUseCase(
      blockedTimeSlotsRepository,
      mockProvidersApi,
    );
  });

  it('should create a blocked time slot successfully', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const startDatetime = new Date('2024-01-08T09:00:00');
    const endDatetime = new Date('2024-01-08T12:00:00');

    const result = await sut.execute({
      clinicId,
      providerId,
      startDatetime,
      endDatetime,
      reason: 'Meeting',
      createdById: 'user-123',
    });

    expect(result.blockedTimeSlot).toBeDefined();
    expect(result.blockedTimeSlot.providerId).toBe(providerId);
    expect(result.blockedTimeSlot.startDatetime).toEqual(startDatetime);
    expect(result.blockedTimeSlot.endDatetime).toEqual(endDatetime);
    expect(result.blockedTimeSlot.reason).toBe('Meeting');
    expect(result.blockedTimeSlot.createdById).toBe('user-123');
    expect(blockedTimeSlotsRepository.items).toHaveLength(1);
  });

  it('should create a blocked time slot without location', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      clinicId,
      providerId,
      startDatetime: new Date('2024-01-08T09:00:00'),
      endDatetime: new Date('2024-01-08T12:00:00'),
    });

    expect(result.blockedTimeSlot.locationId).toBeNull();
  });

  it('should create a blocked time slot with location', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      clinicId,
      providerId,
      locationId: 'location-123',
      startDatetime: new Date('2024-01-08T09:00:00'),
      endDatetime: new Date('2024-01-08T12:00:00'),
    });

    expect(result.blockedTimeSlot.locationId).toBe('location-123');
  });

  it('should throw ResourceNotFoundError if provider not found', async () => {
    mockProvidersApi.findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        clinicId,
        providerId,
        startDatetime: new Date('2024-01-08T09:00:00'),
        endDatetime: new Date('2024-01-08T12:00:00'),
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if provider belongs to different clinic', async () => {
    mockProvidersApi.findById.mockResolvedValue(
      new Provider({
        ...mockProvider,
        clinicId: 'different-clinic',
      }),
    );

    await expect(
      sut.execute({
        clinicId,
        providerId,
        startDatetime: new Date('2024-01-08T09:00:00'),
        endDatetime: new Date('2024-01-08T12:00:00'),
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should create blocked time slot without reason', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      clinicId,
      providerId,
      startDatetime: new Date('2024-01-08T09:00:00'),
      endDatetime: new Date('2024-01-08T12:00:00'),
    });

    expect(result.blockedTimeSlot.reason).toBeNull();
  });
});
