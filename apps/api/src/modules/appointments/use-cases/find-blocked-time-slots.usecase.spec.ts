import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Provider } from '../../providers/entities/provider.entity';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import { InMemoryBlockedTimeSlotsRepository } from '../repositories/in-memory-blocked-time-slots.repository';
import { FindBlockedTimeSlotsUseCase } from './find-blocked-time-slots.usecase';

describe('FindBlockedTimeSlotsUseCase', () => {
  let sut: FindBlockedTimeSlotsUseCase;
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
    specialty: 'General',
  });

  const createMockBlockedTimeSlot = (
    overrides: Partial<BlockedTimeSlot> = {},
  ): BlockedTimeSlot => {
    return new BlockedTimeSlot({
      providerId,
      startDatetime: new Date('2024-01-08T09:00:00'),
      endDatetime: new Date('2024-01-08T12:00:00'),
      reason: 'Meeting',
      ...overrides,
    });
  };

  beforeEach(() => {
    blockedTimeSlotsRepository = new InMemoryBlockedTimeSlotsRepository();

    mockProvidersApi = {
      findById: jest.fn(),
      findByClinicId: jest.fn(),
      findByUserId: jest.fn(),
    };

    sut = new FindBlockedTimeSlotsUseCase(
      blockedTimeSlotsRepository,
      mockProvidersApi,
    );
  });

  it('should return blocked time slots for a provider', async () => {
    const slot1 = createMockBlockedTimeSlot({ id: 'slot-1' });
    const slot2 = createMockBlockedTimeSlot({ id: 'slot-2' });
    blockedTimeSlotsRepository.items.push(slot1, slot2);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.blockedTimeSlots).toHaveLength(2);
  });

  it('should return empty array if no blocked time slots found', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      providerId,
      clinicId,
    });

    expect(result.blockedTimeSlots).toHaveLength(0);
  });

  it('should throw ResourceNotFoundError if provider not found', async () => {
    mockProvidersApi.findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        providerId,
        clinicId,
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
        providerId,
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should filter by location when provided', async () => {
    const slot1 = createMockBlockedTimeSlot({
      id: 'slot-1',
      locationId: 'location-1',
    });
    const slot2 = createMockBlockedTimeSlot({
      id: 'slot-2',
      locationId: 'location-2',
    });
    blockedTimeSlotsRepository.items.push(slot1, slot2);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      providerId,
      clinicId,
      locationId: 'location-1',
    });

    expect(result.blockedTimeSlots).toHaveLength(1);
    expect(result.blockedTimeSlots[0].locationId).toBe('location-1');
  });

  it('should filter by date range when provided', async () => {
    const earlySlot = createMockBlockedTimeSlot({
      id: 'slot-1',
      startDatetime: new Date('2024-01-01T09:00:00'),
      endDatetime: new Date('2024-01-01T12:00:00'),
    });
    const lateSlot = createMockBlockedTimeSlot({
      id: 'slot-2',
      startDatetime: new Date('2024-01-15T09:00:00'),
      endDatetime: new Date('2024-01-15T12:00:00'),
    });
    blockedTimeSlotsRepository.items.push(earlySlot, lateSlot);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    const result = await sut.execute({
      providerId,
      clinicId,
      startDate: new Date('2024-01-10T00:00:00'),
      endDate: new Date('2024-01-20T00:00:00'),
    });

    expect(result.blockedTimeSlots).toHaveLength(1);
    expect(result.blockedTimeSlots[0].id).toBe('slot-2');
  });

  it('should call providersApi.findById with correct provider ID', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    await sut.execute({
      providerId,
      clinicId,
    });

    expect(mockProvidersApi.findById).toHaveBeenCalledWith(providerId);
  });
});
