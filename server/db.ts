import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    // Hosted Postgres (Render/Neon/Supabase) requires SSL
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : null as any;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Database features will be unavailable, falling back to in-memory storage.");
}
