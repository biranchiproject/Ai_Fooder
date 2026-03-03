import { pool } from "./db";

async function addIndexes() {
    console.log("Applying production database indexes for CSAO Recommendation System...");

    const client = await pool.connect();
    try {
        // 1. Geography & Availability Index for Stage 1 Retrieval
        console.log("- Creating index on restaurants(city, is_open)");
        await client.query(`CREATE INDEX IF NOT EXISTS idx_restaurants_city_open ON restaurants(city, is_open);`);

        // 2. Category Filter Index for Menu Items
        console.log("- Creating index on menu_items(restaurant_id, category)");
        await client.query(`CREATE INDEX IF NOT EXISTS idx_menu_items_res_cat ON menu_items(restaurant_id, category);`);

        // 3. Telemetry Analytics Index
        console.log("- Creating index on recommendation_events(experiment_group, type, created_at)");
        await client.query(`CREATE INDEX IF NOT EXISTS idx_rec_events_analysis ON recommendation_events(experiment_group, type, created_at);`);

        // 4. User ID Index for A/B Testing consistency if needed
        console.log("- Creating index on users(uid)");
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);`);

        console.log("Database indexing complete!");
    } catch (err) {
        console.error("Error applying indexes:", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

addIndexes();
