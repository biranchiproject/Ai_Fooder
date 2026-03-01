import "dotenv/config";
import { pool } from "./server/db";

async function fixImage() {
    if (!pool) {
        console.log("No DB connection");
        process.exit(1);
    }

    // Use a generic food/bread image from unsplash
    const goodImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80"; // A bread/food image

    try {
        const res = await pool.query(
            `UPDATE recommendations SET image = $1 WHERE name = 'Garlic Bread'`,
            [goodImageUrl]
        );
        console.log(`Updated garlic bread image. Rows affected: ${res.rowCount}`);
    } catch (e) {
        console.error("Error updating image:", e);
    }

    process.exit(0);
}

fixImage();
