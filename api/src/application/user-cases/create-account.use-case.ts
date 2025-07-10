import { Person } from "../../domain/population/person.entity";

export class CreateAccountUseCase {
  private person: Person;
  constructor(person: Person) {
    this.person = person;
  }

  async execute(): Promise<void> {
    if (!this.person.accountNumber) {

      const body = { salaryCents: Math.floor(this.person.salary * 100)};
      const createAccountResponse = await fetch(process.env.RETAIL_BANK_API_URL + '/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const account = await createAccountResponse.json();
      this.person.accountNumber = account.accountId;
    } else {
      // person already has an account, no need to create another one
    }
  }

}