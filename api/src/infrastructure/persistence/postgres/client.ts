import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.POSTGRES_USER || "postgres",
  host: process.env.POSTGRES_HOST || "",
  database: process.env.POSTGRES_DB || "",
  password: process.env.POSTGRES_PASSWORD || "@970810",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
}); 