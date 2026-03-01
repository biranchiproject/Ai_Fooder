import "dotenv/config";
import { seedData } from "./server/routes";
import fs from "fs";

async function runSeed() {
    try {
        console.log("Starting manual seed...");
        await seedData();
        console.log("Seed completed successfully!");
    } catch (err: any) {
        fs.writeFileSync("seed-error2.txt", "Seed error:\n" + err.toString() + "\nMessage:\n" + err.message + "\nStack:\n" + err.stack);
        console.error("Seed error captured to seed-error2.txt");
    }
    process.exit(0);
}

runSeed();
