import "dotenv/config";
import { db } from "./server/db";
import { users } from "./shared/schema";

async function checkDb() {
    try {
        const allUsers = await db.select().from(users);
        console.log("Users in DB:", allUsers);
    } catch (err) {
        console.error("DB error:", err);
    }
    process.exit(0);
}

checkDb();
