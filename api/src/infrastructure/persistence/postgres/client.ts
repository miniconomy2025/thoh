import 'dotenv/config';
import { Pool } from 'pg';
import { DataSource } from 'typeorm';
import { Person } from '../../../domain/population/person.entity';
import { Phone } from '../../../domain/population/phone.entity';
import { PhoneStatic } from '../../../domain/population/phone-static.entity';
import { MaterialStatic } from '../../../domain/market/material-static.entity';
import { Machine } from '../../../domain/market/machine.entity';
import { MachineStatic } from '../../../domain/market/machine-static.entity';
import { MachineMaterialRatio } from '../../../domain/market/machine-material-ratio.entity';
import { Equipment } from '../../../domain/market/equipment.entity';
import { Truck } from '../../../domain/market/vehicle.entity';
import { VehicleStatic } from '../../../domain/market/vehicle-static.entity';
import { RawMaterial } from '../../../domain/market/raw-material.entity';
import { Order } from '../../../domain/market/order.entity';
import { Collection } from '../../../domain/market/collection.entity';
import { Population } from '../../../domain/population/population.entity';
import { Currency } from '../../../domain/population/currency.entity';
import { Recycle } from '../../../domain/population/recycle.entity';
import { Simulation } from '../../../domain/simulation/simulation.entity';
// Add other entities as needed

export const pool = new Pool({
  user: process.env.POSTGRES_USER ,
  host: process.env.POSTGRES_HOST ,
  database: process.env.POSTGRES_DB ,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // Use migrations
  logging: true,
  entities: [
    Person, Phone, PhoneStatic, MaterialStatic, Machine, MachineStatic, MachineMaterialRatio, Equipment, Truck, VehicleStatic, RawMaterial, Order, Collection, Population, Currency, Recycle, Simulation
  ], // Add all entities here
  migrations: ['src/infrastructure/persistence/postgres/migrations/*.ts'],
  subscribers: [],
}); 