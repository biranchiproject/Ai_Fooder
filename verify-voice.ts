import "dotenv/config";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
if (!groq) {
    console.error("GROQ_API_KEY not found in .env");
    process.exit(1);
}

async function testVoiceAssistantLogic(message: string, history: any[] = []) {
    console.log(`\n--- Testing Message: "${message}" ---`);

    if (!history || history.length === 0) {
        history.push({
            role: "system",
            content: `You are a food ordering assistant.
Extract structured JSON from the user's request:
{
  "item_name": string | null,
  "restaurant_name": string | null,
  "pincode": string | null,
  "payment_method": "cod" | "online" | null,
  "confirmation": "yes" | "no" | null
}
Only respond in valid JSON. No other text.`
        });
    }

    history.push({ role: "user", content: message });

    const completion = await groq!.chat.completions.create({
        messages: history as any,
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0].message.content;
    console.log("AI Raw Response:", aiResponse);

    try {
        const extracted = JSON.parse(aiResponse || "{}");
        console.log("Extracted JSON:", JSON.stringify(extracted, null, 2));

        // Mock logic check
        if (extracted.item_name) console.log(`[OK] Searching for item: ${extracted.item_name}`);
        if (extracted.restaurant_name) console.log(`[OK] Searching for restaurant: ${extracted.restaurant_name}`);
        if (extracted.pincode) console.log(`[OK] Setting location to pincode: ${extracted.pincode}`);
        if (extracted.payment_method === 'cod') console.log(`[OK] Setting payment to COD`);
        if (extracted.confirmation === 'yes') console.log(`[OK] Triggering addToCart signal`);

    } catch (e) {
        console.error("Failed to parse JSON", e);
    }
}

(async () => {
    try {
        const history: any[] = [];
        await testVoiceAssistantLogic("I want to order Special Hyderabad Dum Biryani from Royal Point", history);
        await testVoiceAssistantLogic("My pincode is 400001 and I want to pay with cash", history);
        await testVoiceAssistantLogic("Yes, please confirm the order", history);
    } catch (err) {
        console.error("Test failed:", err);
    }
})();
