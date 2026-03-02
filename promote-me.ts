import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";

async function promote(email: string) {
    console.log(`Promoting user with email: ${email}`);

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }

    await db.update(users)
        .set({ role: "superadmin" })
        .where(eq(users.id, user.id));

    console.log(`Success! User ${user.username} is now a superadmin.`);
    process.exit(0);
}

const email = process.argv[2];
if (!email) {
    console.error("Please provide an email address: npx tsx promote-me.ts your@email.com");
    process.exit(1);
}

promote(email);
