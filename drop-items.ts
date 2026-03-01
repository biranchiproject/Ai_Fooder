import "dotenv/config";
import { pool } from "./server/db";

async function fixDb() {
    if (!pool) return;
    try {
        console.log("Dropping obsolete items table...");
        await pool.query(`DROP TABLE IF EXISTS items CASCADE;`);
        console.log("Items table dropped.");
    } catch (err: any) {
        console.error("Error:", err);
    }
    process.exit(0);
}

fixDb();
