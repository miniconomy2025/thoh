import { ISimulationRepository, IMarketRepository } from '../ports/repository.ports';
import { HandlePeriodicFailuresUseCase } from './handle-periodic-failures.use-case';
import { BreakPhonesUseCase } from './break-phones.use-case';
import { RecyclePhonesUseCase } from './recycle-phones.use-case';
import { BuyPhoneUseCase } from './buy-phone-use-case';
import { QueueFactory } from '../../infrastructure/queue/queue.factory';

export class AdvanceSimulationDayUseCase {
  private readonly recyclePhonesUseCase: RecyclePhonesUseCase;
  private readonly handlePeriodicFailuresUseCase: HandlePeriodicFailuresUseCase;

  constructor(
    private readonly simulationRepo: ISimulationRepository,
    private readonly marketRepo: IMarketRepository,
    private readonly breakPhonesUseCase: BreakPhonesUseCase,
    private readonly buyPhoneUseCase: BuyPhoneUseCase
  ) {
    this.recyclePhonesUseCase = new RecyclePhonesUseCase();
    this.handlePeriodicFailuresUseCase = new HandlePeriodicFailuresUseCase(marketRepo);
  }

  public async execute(simulationId: number): Promise<void> {
    const simulation = await this.simulationRepo.findById(simulationId);
    const rawMaterialsMarket = await this.marketRepo.findRawMaterialsMarket();
    const machinesMarket = await this.marketRepo.findMachinesMarket();
    const trucksMarket = await this.marketRepo.findTrucksMarket();

    if (!simulation || !rawMaterialsMarket || !machinesMarket || !trucksMarket) {
      throw new Error('Simulation or market not found');
    }

    // Check for phones to recycle every 7 days
    if (simulation.currentDay % 7 === 0) {
      try {
        const grouped = await this.recyclePhonesUseCase.listGroupedByModel();
        if (grouped.length > 0) {
          const businessQueue = QueueFactory.getBusinessQueue();
          await businessQueue.sendMessage({
            body: {
              type: 'phone_recycle',
              payload: {
                recycleQuantity: grouped.reduce((sum, group) => sum + group.quantity, 0)
              }
            },
            messageGroupId: 'phone-recycle', // Add MessageGroupId for FIFO queue
            attributes: {
                MessageDeduplicationId: `phone-recycle-${simulation.getCurrentSimDateString()}-${Date.now()}` // Add deduplication ID
            }
          });
          console.log('Phone recycling queued');
        }
      } catch (err) {
        console.error('Failed to queue phone recycling:', err);
      }
    }

    // Advance the day
    simulation.advanceDay();
    rawMaterialsMarket.applyDailyRandomness();
    machinesMarket.applyDailyRandomness();
    trucksMarket.applyDailyRandomness();

    // Handle periodic failures
    await this.handlePeriodicFailuresUseCase.execute(simulation);

    // Simulate someone randomly buying a phone
    await this.buyPhoneUseCase.execute();

    // Save all changes
    await this.simulationRepo.save(simulation);
    await this.marketRepo.saveRawMaterialsMarket(rawMaterialsMarket);
    await this.marketRepo.saveMachinesMarket(machinesMarket);
    await this.marketRepo.saveTrucksMarket(trucksMarket);
    await this.breakPhonesUseCase.execute();
  }
} 
