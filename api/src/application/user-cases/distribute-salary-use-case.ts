import { IPopulationRepository } from "../ports/repository.ports";
import { BankPaymentRequest, IBankService, INotificationService } from "../ports/service.ports";
import { toPopulationAggregate } from '../../infrastructure/persistence/postgres/population.mapper';
import { RecycleRepository } from '../../infrastructure/persistence/postgres/recycle.repository';
import { PersonRepository } from '../../infrastructure/persistence/postgres/person.repository';
import { Phone } from '../../domain/population/phone.entity';
import { Recycle } from '../../domain/population/recycle.entity';

//not implemented
export class DistributeSalariesUseCase {
    constructor(private readonly populationRepo: IPopulationRepository, private readonly bankService: IBankService, private readonly notificationService: INotificationService) {}
    public async execute(): Promise<void> {
        const populationEntity = await this.populationRepo.find();
        if (!populationEntity) throw new Error('Population not found');
        const population = toPopulationAggregate(populationEntity);
        const paymentsToMake = population.getSalaryPayments();
        if (paymentsToMake.length === 0) {
            await this.notificationService.notify("Salary day: No one to pay."); return;
        }
        // const bankPayments: BankPaymentRequest[] = paymentsToMake.map(p => ({ fromAccountId: 'thoh-treasury-account', toAccountId: p.toBankAccountId, amount: p.amount }));
        // await this.bankService.executeBulkPayments(bankPayments);
        // await this.notificationService.notify(`Distributed salaries to ${paymentsToMake.length} people.`);
    }
}