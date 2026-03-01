import "dotenv/config";
import { pool } from "./server/db";

async function main() {
    if (!pool) {
        console.log("No pool available");
        process.exit(1);
    }
    try {
        console.log("Adding uid to users table...");
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS uid TEXT;`);
        await pool.query(`UPDATE users SET uid = username WHERE uid IS NULL;`);

        // Only set NOT NULL if there are no NULLs left (which there shouldn't be now)
        await pool.query(`ALTER TABLE users ALTER COLUMN uid SET NOT NULL;`);

        // Add unique constraint if it doesn't exist. We can try/catch this line.
        try {
            await pool.query(`ALTER TABLE users ADD CONSTRAINT users_uid_unique UNIQUE (uid);`);
        } catch (err: any) {
            console.log("Unique constraint might already exist or failed:", err.message);
        }

        console.log("Users schema synchronization complete!");
    } catch (e) {
        console.error("DDL Force Error:", e);
    }
    process.exit(0);
}

main();
