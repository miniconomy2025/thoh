import { Person } from "../../domain/population/person.entity";
import { QueueFactory } from "../../infrastructure/queue/queue.factory";

export class CreateAccountUseCase {
  private person: Person;
  constructor(person: Person) {
    this.person = person;
  }

  async execute(): Promise<void> {
    if (!this.person.accountNumber) {
      // Validate required fields
      if (!this.person.id || this.person.salary === undefined || this.person.salary === null) {
        console.error('Cannot create account: person ID or salary is missing', {
          id: this.person.id,
          salary: this.person.salary
        });
        throw new Error('Person ID and salary are required for account creation');
      }

      const criticalQueue = QueueFactory.getCriticalQueue();
      const salaryCents = Math.floor(this.person.salary * 100);
      
      // Queue the account creation request
      await criticalQueue.sendMessage({
        body: {
          type: 'account_creation',
          payload: {
            salaryCents,
            personId: this.person.id
          }
        },
        messageGroupId: 'account-creation',
        attributes: {
          MessageDeduplicationId: `account-creation-${this.person.id}-${Date.now()}`
        }
      });

      console.log(`Account creation queued for person ${this.person.id} with salary ${this.person.salary}`);
    } else {
      console.log(`Person ${this.person.id} already has account ${this.person.accountNumber}`);
    }
  }
}