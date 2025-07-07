import 'dotenv/config';
import { DataSource } from "typeorm";
import { Machine } from "./machine.entity";
import { Truck } from "./vehicle.entity";
import { RawMaterial } from "./raw-material.entity";
import { Collection } from "./collection.entity";
import { Simulation } from "../simulation/simulation.entity";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST ,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD ,
  database: process.env.POSTGRES_DB ,
  synchronize: false,
  logging: true,
      entities: [Machine, Truck, RawMaterial, Collection, Simulation],
  migrations: ["src/infrastructure/persistence/postgres/migrations/*.ts"],
}); 