import type { Phone } from "./phone.type";

export type Person = {
  id: number;
  salary: number;
  phone: Phone | null;
  phoneWorking: boolean;
};

export type People = Person[];