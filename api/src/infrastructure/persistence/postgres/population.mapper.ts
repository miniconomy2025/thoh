import { Population } from '../../../domain/population/population.aggregate';
import { Person } from '../../../domain/population/person.entity';
import { Phone } from '../../../domain/population/phone.entity';

export const PopulationMapper = {
  toDb(population: Population) {
    return {
      
    };
  },

  fromDb(data: any) {
    // const people = Array.isArray(data.people)
    //   ? data.people.map((p: any) => {
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