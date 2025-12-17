import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { Provider } from '../../providers/entities/provider.entity';
import { BlockedTimeSlot } from '../entities/blocked-time-slot.entity';
import { InMemoryBlockedTimeSlotsRepository } from '../repositories/in-memory-blocked-time-slots.repository';
import { DeleteBlockedTimeSlotUseCase } from './delete-blocked-time-slot.usecase';

describe('DeleteBlockedTimeSlotUseCase', () => {
  let sut: DeleteBlockedTimeSlotUseCase;
  let blockedTimeSlotsRepository: InMemoryBlockedTimeSlotsRepository;
  let mockProvidersApi: {
    findById: jest.Mock;
    findByClinicId: jest.Mock;
    findByUserId: jest.Mock;
  };

  const clinicId = 'clinic-123';
  const providerId = 'provider-123';
  const blockedTimeSlotId = 'blocked-123';

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
      id: blockedTimeSlotId,
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

    sut = new DeleteBlockedTimeSlotUseCase(
      blockedTimeSlotsRepository,
      mockProvidersApi,
    );
  });

  it('should delete a blocked time slot successfully', async () => {
    const blockedTimeSlot = createMockBlockedTimeSlot();
    blockedTimeSlotsRepository.items.push(blockedTimeSlot);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    await sut.execute({
      blockedTimeSlotId,
      clinicId,
    });

    expect(blockedTimeSlotsRepository.items).toHaveLength(0);
  });

  it('should throw ResourceNotFoundError if blocked time slot not found', async () => {
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    await expect(
      sut.execute({
        blockedTimeSlotId: 'non-existent',
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if provider not found', async () => {
    const blockedTimeSlot = createMockBlockedTimeSlot();
    blockedTimeSlotsRepository.items.push(blockedTimeSlot);
    mockProvidersApi.findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        blockedTimeSlotId,
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should throw ResourceNotFoundError if provider belongs to different clinic', async () => {
    const blockedTimeSlot = createMockBlockedTimeSlot();
    blockedTimeSlotsRepository.items.push(blockedTimeSlot);
    mockProvidersApi.findById.mockResolvedValue(
      new Provider({
        ...mockProvider,
        clinicId: 'different-clinic',
      }),
    );

    await expect(
      sut.execute({
        blockedTimeSlotId,
        clinicId,
      }),
    ).rejects.toThrow(ResourceNotFoundError);
  });

  it('should call providersApi.findById with correct provider ID', async () => {
    const blockedTimeSlot = createMockBlockedTimeSlot();
    blockedTimeSlotsRepository.items.push(blockedTimeSlot);
    mockProvidersApi.findById.mockResolvedValue(mockProvider);

    await sut.execute({
      blockedTimeSlotId,
      clinicId,
    });

    expect(mockProvidersApi.findById).toHaveBeenCalledWith(providerId);
  });
});
