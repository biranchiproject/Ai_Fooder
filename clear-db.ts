import "dotenv/config";
import { storage } from "./server/storage";

async function forceClear() {
    try {
        console.log("Clearing all restaurants, menu items, and recommendations...");
        await storage.clearAllRestaurants();
        console.log("Cleared successfully.");
    } catch (err) {
        console.error("Error clearing DB:", err);
    }
    process.exit(0);
}

forceClear();
