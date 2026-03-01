import fetch from "node-fetch";

async function testAffinity() {
    const url = "http://localhost:5000/api/recommendations";
    const body = {
        cart_item_ids: [1] // Assuming 1 is a Biryani or similar item with affinity
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Recommendation Response:", JSON.stringify(data, null, 2));

        if (data.items && data.items.length > 0) {
            console.log("Success: Recommendations fetched!");
        } else {
            console.log("Warning: No recommendations returned.");
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testAffinity();
