import "dotenv/config";
import { pool } from "./server/db";

async function createRecommendations() {
    if (!pool) return;
    try {
        console.log("Creating recommendations table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recommendations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                image TEXT NOT NULL
            );
        `);
        console.log("Recommendations table created.");
    } catch (err: any) {
        console.error("Error:", err);
    }
    process.exit(0);
}

createRecommendations();
