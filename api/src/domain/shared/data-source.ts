import 'dotenv/config';
import { DataSource } from "typeorm";
import { Person } from "../population/person.entity";
import { Phone } from "../population/phone.entity";
import { PhoneStatic } from "../population/phone-static.entity";
import { Population } from "../population/population.entity";
import { Simulation } from "../simulation/simulation.entity";
import { Recycle } from "../population/recycle.entity";
import { Machine } from "../market/machine.entity";
import { Truck } from "../market/vehicle.entity";
import { RawMaterial } from "../market/raw-material.entity";
import { Collection } from "../market/collection.entity";
import { Order } from "../market/order.entity";
import { MaterialStatic } from "../market/material-static.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST ,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD ,
  database: process.env.POSTGRES_DB ,
  synchronize: false,
  logging: true,
  entities: [
    Person, Phone, PhoneStatic, Population, Simulation, Recycle,
    Order, Machine, Truck, RawMaterial, Collection, MaterialStatic
  ],
  migrations: ["src/infrastructure/persistence/postgres/migrations/*.ts"],
}); 