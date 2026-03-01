import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        await db.execute(sql`DROP TABLE IF EXISTS items CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS cart_events CASCADE;`);
        console.log("Conflicting tables dropped successfully.");
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
main();
