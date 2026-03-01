import "dotenv/config";
import { db } from "./server/db";
import { restaurants, menuItems } from "./shared/schema";

async function countRecords() {
    try {
        const res = await db.select().from(restaurants);
        console.log(`Restaurants count: ${res.length}`);

        const items = await db.select().from(menuItems);
        console.log(`Menu Items count: ${items.length}`);
    } catch (err) {
        console.error("DB error:", err);
    }
    process.exit(0);
}

countRecords();
