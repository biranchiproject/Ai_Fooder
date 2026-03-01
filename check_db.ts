import { pool } from "./server/db";

async function main() {
    if (!pool) {
        console.log("No pool");
        process.exit(1);
    }
    try {
        const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurants';
    `);
        console.log("Restaurants table columns:");
        console.table(res.rows);

        const res2 = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
        console.log("All tables:");
        console.table(res2.rows);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
