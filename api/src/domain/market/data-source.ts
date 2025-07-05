import "reflect-metadata";
import { DataSource } from "typeorm";
import { Machine } from "./machine.entity";
import { Vehicle } from "./vehicle.entity";
import { RawMaterial } from "./raw-material.entity";
import { Market } from "./market.entity";
import { Simulation } from "../simulation/simulation.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "Tshabalala@970810",
  database: process.env.POSTGRES_DB || "thoh",
  synchronize: false,
  logging: true,
  entities: [Machine, Vehicle, RawMaterial, Market, Simulation],
  migrations: ["src/infrastructure/persistence/postgres/migrations/*.ts"],
}); 