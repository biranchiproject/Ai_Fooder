import { pool } from "./db";

async function checkCounts() {
    const client = await pool.connect();
    try {
        const resCount = await client.query('SELECT COUNT(*) FROM restaurants');
        const menuCount = await client.query('SELECT COUNT(*) FROM menu_items');
        console.log(`Restaurants: ${resCount.rows[0].count}`);
        console.log(`Menu Items: ${menuCount.rows[0].count}`);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        process.exit(0);
    }
}

checkCounts();
