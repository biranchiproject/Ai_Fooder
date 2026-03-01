import { pool, db } from "./server/db";
import { menuItems, restaurants } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    if (!pool) {
        console.log("No pool");
        process.exit(1);
    }
    try {
        const type = "desserts";
        const results = await db.select({
            menuItem: menuItems,
            restaurant: restaurants,
        })
            .from(menuItems)
            .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
            .where(eq(menuItems.type, type));

        console.log(`Found ${results.length} items for type: ${type}`);
        if (results.length > 0) {
            console.log("Sample item:", JSON.stringify(results[0], null, 2));
        }

        // Check for any items with null restaurant or broken link (though innerJoin prevents nulls)
        const orphans = await db.select()
            .from(menuItems)
            .where(eq(menuItems.type, type));

        console.log(`Total desserts in menuItems table: ${orphans.length}`);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();
