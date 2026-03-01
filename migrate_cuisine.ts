import { pool } from "./server/db";

async function main() {
    if (!pool) {
        console.error("DATABASE_URL not set. Cannot update schema.");
        process.exit(1);
    }
    try {
        console.log("Adding cuisine_type column to menu_items...");
        await pool.query(`
            ALTER TABLE menu_items 
            ADD COLUMN IF NOT EXISTS cuisine_type text DEFAULT 'Indian' NOT NULL;
        `);
        console.log("Success!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

main();
