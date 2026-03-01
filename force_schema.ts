import "dotenv/config";
import { pool } from "./server/db";

async function main() {
  if (!pool) {
    console.log("No pool available");
    process.exit(1);
  }
  try {
    console.log("Adding missing columns forcefully via DDL...");
    await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';`);
    // Attempting to recreate the whole missing table structure matching schema.ts if it was totally dropped
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        image TEXT NOT NULL,
        rating NUMERIC NOT NULL,
        delivery_time TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        price_range TEXT NOT NULL,
        location TEXT NOT NULL,
        distance TEXT NOT NULL,
        is_veg TEXT NOT NULL DEFAULT 'both',
        is_pure_veg_restaurant BOOLEAN DEFAULT false NOT NULL,
        is_bestseller TEXT NOT NULL
      );
    `);

    // Check missing columns in restaurants table and insert if needed
    await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_pure_veg_restaurant BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_bestseller TEXT DEFAULT 'no';`);
    await pool.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_veg TEXT DEFAULT 'both';`);

    console.log("Creating menu_items table if missing...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL references restaurants(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL,
        category TEXT NOT NULL,
        is_veg BOOLEAN NOT NULL,
        is_pure_veg BOOLEAN DEFAULT false NOT NULL,
        type TEXT NOT NULL
      );
    `);

    // Ensure the users table exists for orders referencing
    console.log("Creating users table if missing...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        mobile TEXT DEFAULT '',
        full_name TEXT DEFAULT '',
        photo_url TEXT DEFAULT '',
        role TEXT DEFAULT 'customer',
        address TEXT DEFAULT '',
        is_profile_complete BOOLEAN DEFAULT false
      );
    `);

    console.log("Creating orders tables if missing...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL references users(id),
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        created_at TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL references orders(id),
        item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL
      );
    `);

    console.log("Database schema synchronization complete!");
  } catch (e) {
    console.error("DDL Force Error:", e);
  }
  process.exit(0);
}
main();
