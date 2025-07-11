import { Person } from "../../domain/population/person.entity";
import {Agent} from "undici";
import fs from "fs";
import path from "node:path";
import { fetch } from 'undici';

export class CreateAccountUseCase {
  private person: Person;
  constructor(person: Person) {
    this.person = person;
  }

  async execute(): Promise<void> {
    if (!this.person.accountNumber) {

      const agent = new Agent({
        connect: {
          cert : fs.readFileSync(path.join(__dirname, 'thoh-client.crt')),
          key : fs.readFileSync(path.join(__dirname, 'thoh-client.key')),
          rejectUnauthorized: false
        }
      });

      const body = { salaryCents: Math.floor(this.person.salary * 100)};
      console.log(JSON.stringify({
        body: body
      }));
      const createAccountResponse = await fetch(process.env.RETAIL_BANK_API_URL + '/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        dispatcher: agent,
      });

      const account = await createAccountResponse.body;
      // @ts-ignore
      this.person.accountNumber = account.accountId;
    } else {
      // person already has an account, no need to create another one
    }
  }

}