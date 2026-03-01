import "dotenv/config";
import { db } from "./server/db";
import { recommendations } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixRecos() {
    const recs = [
        { name: "Extra Cheese", image: "https://images.unsplash.com/photo-1481070555726-e2fe83477d15?w=500&q=80" },
        { name: "Garlic Bread", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80" },
        { name: "Coke 500ml", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80" },
        { name: "Chocolate Brownie", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
        { name: "Potato Wedges", image: "https://images.unsplash.com/photo-1573080496597-1a40ecda99fe?w=500&q=80" }
    ];

    for (const rec of recs) {
        if (rec.image) {
            await db.update(recommendations)
                .set({ image: rec.image })
                .where(eq(recommendations.name, rec.name));
            console.log(`Updated ${rec.name}`);
        }
    }
    process.exit(0);
}

fixRecos().catch(console.error);
