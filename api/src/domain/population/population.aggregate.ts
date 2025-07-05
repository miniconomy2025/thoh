import { Money } from "../shared/value-objects";
import { Person } from "./person.entity";
import { getPhoneModels } from '../shared/config';
import { Phone } from './phone.entity';

export class Population {
    id: number;
    simulationId?: number;
    private people: Map<number, Person>;

    constructor(id: number, initialPeople: Person[], simulationId?: number) {
        this.id = id;
        this.simulationId = simulationId;
        this.people = new Map(initialPeople.map(p => [p.id, p]));
    }

    public addPerson(person: Person): void {
        if (this.people.has(person.id)) {
            throw new Error(`Person with ID ${person.id} already exists in the population.`);
        }
        this.people.set(person.id, person);
    }

    /**
     * Identifies salary payment details for everyone.
     * The actual bank transfer is an external concern handled by a service.
     * @returns A list of salary payments to be made.
     */
    public getSalaryPayments(): { toBankAccountId: string, amount: Number }[] {
        const payments = [];
        for (const person of this.people.values()) {
            payments.push({
                toBankAccountId: person.bankAccountId,
                amount: person.salary
            });
        }
        return payments;
    }

    public findPersonById(personId: number): Person | undefined {
        return this.people.get(personId);
    }
    
    public getAllPeople(): Person[] {
        return Array.from(this.people.values());
    }

    distributeSalaries() {
        for (const person of this.people.values()) {
            // Salary distribution logic (stub)
            // In real app, would interact with bank service
        }
    }

    triggerPhonePurchase() {
        const phoneModels = getPhoneModels();
        for (const person of this.people.values()) {
            if (!person.phone || !person.phoneWorking) {
                // Randomly pick a phone model
                const model = phoneModels[Math.floor(Math.random() * phoneModels.length)];
                // person.buyPhone(new Phone(model));
            }
        }
    }

    triggerPhoneBreakdown() {
        for (const person of this.people.values()) {
            // 5% chance phone breaks each day
            if (person.phone && person.phoneWorking && Math.random() < 0.05) {
                // person.breakPhone();
            }
        }
    }

    public getPeople(): Person[] {
        return Array.from(this.people.values());
    }
}