import 'dotenv/config';
import { DataSource } from "typeorm";
import { Person } from "./person.entity";
import { Phone } from "./phone.entity";
import { PhoneStatic } from "./phone-static.entity";
import { Population } from "./population.entity";
import { Simulation } from "../simulation/simulation.entity";
import { Recycle } from "./recycle.entity";



export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: true,
  ssl: process.env.NODE_ENV === 'production',
  entities: [Person, Phone, PhoneStatic, Population, Simulation, Recycle],
  migrations: ["src/infrastructure/persistence/postgres/migrations/*.ts"]
}); 