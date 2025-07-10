import { Population as PopulationEntity } from '../../../domain/population/population.entity';
import { Population as PopulationAggregate } from '../../../domain/population/population.aggregate';
import { Person } from '../../../domain/population/person.entity';

export function toPopulationAggregate(entity: PopulationEntity): PopulationAggregate {
    return new PopulationAggregate(entity.id, [], entity.simulationId);
}

export const PopulationMapper = {
  toDb(population: PopulationAggregate) {
    return {
      
    };
  },

  fromDb(data: Record<string, unknown>) {
    // const people = Array.isArray(data.people)
    //   ? data.people.map((p: Record<string, unknown>) => {
    //       const salary = { amount: p.salary.amount, currency: p.salary.currency };
    //       const phone = p.phone ? new Phone(p.phone.model) : null;
    //       if (phone && p.phoneWorking === false) phone.break();
    //       return new Person(
    //         p.id,
    //         p.bankAccountId,
    //         salary,
    //         phone,
    //         p.phoneWorking
    //       );
    //     })
    //   : [];
    // return new Population(people);
  }
}; 