import { pool } from "./server/db";

async function testCSAO() {
    if (!pool) {
        console.log("No pool");
        process.exit(1);
    }

    const query = `
    WITH cart AS (
      SELECT unnest($1::int[]) AS item_id
    ),
    co_occurrences AS (
      SELECT 
        o2.item_id, 
        COUNT(*) AS freq
      FROM order_items o1
      JOIN order_items o2 ON o1.order_id = o2.order_id
      WHERE o1.item_id IN (SELECT item_id FROM cart)
        AND o2.item_id NOT IN (SELECT item_id FROM cart)
      GROUP BY o2.item_id
    )
    SELECT 
      i.id, 
      i.name,
      i.image,
      ROUND(CAST(
        (COALESCE(c.freq, 0) * 0.6) + 
        (4.5 * 0.2) + 
        (4.5 * 0.2)
      AS numeric), 2) AS score
    FROM menu_items i
    LEFT JOIN co_occurrences c ON i.id = c.item_id
    WHERE i.id NOT IN (SELECT item_id FROM cart)
    ORDER BY score DESC
    LIMIT 8;
  `;

    try {
        const res = await pool.query(query, [[1, 2]]);
        console.log("Query success! Rows:", res.rowCount);
    } catch (e) {
        console.error("Query Error Encountered:", e.message);
    }
    process.exit(0);
}

testCSAO();
