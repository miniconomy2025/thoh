import { Person } from "../../domain/population/person.entity";
import { QueueFactory } from "../../infrastructure/queue/queue.factory";

export class CreateAccountUseCase {
  private person: Person;
  constructor(person: Person) {
    this.person = person;
  }

  async execute(): Promise<void> {
    if (!this.person.accountNumber) {
      const criticalQueue = QueueFactory.getCriticalQueue();
      
      // Queue the account creation request
      await criticalQueue.sendMessage({
        body: {
          type: 'account_creation',
          payload: {
            salaryCents: Math.floor(this.person.salary * 100),
            personId: this.person.id // Include person ID for response handling
          }
        },
        messageGroupId: 'account-creation', // Add MessageGroupId for FIFO queue
        attributes: {
          MessageDeduplicationId: `account-creation-${this.person.id}-${Date.now()}` // Add deduplication ID
        }
      });

      console.log(`Account creation queued for person ${this.person.id}`);
      // Note: The account number will be set by the queue consumer when it processes
      // the response from the bank API. The consumer will:
      // 1. Call the bank API to create the account
      // 2. Get the account number from the response
      // 3. Update the person record with the account number using PersonRepository
    } else {
      // person already has an account, no need to create another one
    }
  }
}