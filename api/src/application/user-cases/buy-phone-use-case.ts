import { Person } from "../../domain/population/person.entity";
import { PersonRepository } from "../../infrastructure/persistence/postgres/person.repository";

export class BuyPhoneUseCase {
  private readonly pearModels = ['ePhone', 'ePhone_plus', 'ePhone_pro_max'];
  private readonly sumSangModels = ['Cosmos_Z25', 'Cosmos_Z25_ultra', 'Cosmos_Z25_FE'];

  async execute(): Promise<void> {
    const people = await PersonRepository.getRepo().find({ relations: ['phone', 'phone.model'] });

    for (const person of people) {
      if (person.phone !== null) continue;

      const usePear = Math.random() % 2 === 0;
      const model = this.getRandomModel(usePear);
      const apiUrl = usePear ? process.env.PEAR_PHONE_API_URL : process.env.SUM_SANG_API_URL;

      const success = await this.createOrder(person, model, apiUrl);
      if (!success) break;
    }
  }

  private getRandomModel(usePear: boolean): string {
    const models = usePear ? this.pearModels : this.sumSangModels;
    return models[Math.floor(Math.random() * models.length)];
  }

  private async createOrder(person: Person, model: string, baseUrl?: string): Promise<boolean> {
    const body = {
      account_number: person.accountNumber,
      items: [{ name: model, quantity: 1 }]
    };

    try {
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error(`❌ Failed to create order for person ${person.id}: ${response.statusText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`🚨 Network error for person ${person.id}:`, error);
      return false;
    }
  }
}
