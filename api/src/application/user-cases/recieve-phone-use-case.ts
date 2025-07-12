import { PhoneStatic } from "../../domain/population/phone-static.entity";
import { PersonRepository } from "../../infrastructure/persistence/postgres/person.repository";
import { IPopulationRepository } from "../ports/repository.ports";

export class ReceivePhoneUseCase {
  constructor(private readonly populationRepo: IPopulationRepository) {}
  async execute(accountNumber: string, model: PhoneStatic): Promise<void> {
    const repo = PersonRepository.getRepo();
    const person = await repo.findOne({
      where: { accountNumber },
      relations: ['phone', 'phone.model']
    });

    if (!person) {
      console.warn(`Person with account number ${accountNumber} not found.`);
      return;
    }

    person.phone = {
      id: Math.floor(Math.random() * 1_000_000),
      isBroken: false,
      model
    };

    await repo.save(person);
  }
}
