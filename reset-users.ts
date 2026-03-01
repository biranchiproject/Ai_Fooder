import "dotenv/config";
import { pool } from "./server/db";

async function main() {
    if (!pool) {
        process.exit(1);
    }
    try {
        console.log("Dropping tables...");
        await pool.query(`DROP TABLE IF EXISTS order_items CASCADE;`);
        await pool.query(`DROP TABLE IF EXISTS orders CASCADE;`);
        await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
        console.log("Dropped outdated tables successfully.");
    } catch (e) {
        console.error("DB Error:", e);
    }
    process.exit(0);
}

main();
