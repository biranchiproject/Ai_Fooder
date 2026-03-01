import "dotenv/config";
import { pool } from "./server/db";
import fs from "fs";

async function main() {
    if (!pool) {
        process.exit(1);
    }
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        const out = res.rows.map(r => `- ${r.column_name}: ${r.data_type}`).join("\n");
        fs.writeFileSync("columns.txt", out);
    } catch (e) {
    }
    process.exit(0);
}

main();
