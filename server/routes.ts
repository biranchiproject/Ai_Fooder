import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { foodData, restaurantData } from "./data";
import * as ort from "onnxruntime-node";
import { LRUCache } from "lru-cache";
import crypto from "crypto";
import path from "path";
import Groq from "groq-sdk";

let groq: Groq | null = null;
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!groq && apiKey) {
    groq = new Groq({ apiKey });
  }
  return groq;
}

// 1GB RAM EC2 Safe Cache Configuration
const recsCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes cache invalidation
});

let onnxSession: ort.InferenceSession | null = null;
async function initONNX() {
  try {
    const modelPath = path.join(process.cwd(), "server", "model.onnx");
    onnxSession = await ort.InferenceSession.create(modelPath);
    console.log("[ML] Successfully loaded LightGBM ONNX model.");
  } catch (e) {
    console.error("[ML Error] Failed to load ONNX model. Falling back to SQL:", e);
  }
}
initONNX();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  function requireAdmin(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }

  function requireSuperAdmin(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  }

  // ==========================================
  // SuperAdmin & Admin Routes
  // ==========================================
  app.get("/api/users", requireSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users/:id/promote", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, { role: "admin" });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: "Failed to promote user" });
    }
  });

  app.post("/api/users/:id/demote", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, { role: "user" });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: "Failed to demote user" });
    }
  });

  app.post("/api/food", requireAdmin, async (req, res) => {
    try {
      let { restaurantId, hotelName, location, name, price, image, category, description, isVeg } = req.body;

      if (!restaurantId && hotelName) {
        const existing = await storage.getRestaurantsByName(hotelName);
        if (existing.length > 0) {
          restaurantId = existing[0].id;
        } else {
          const newRes = await storage.createRestaurant({
            name: hotelName,
            location: location || "Unknown",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
            rating: "4.5",
            delivery_time: "30-40 min",
            cuisine: category || "Indian",
            price_range: "₹₹",
            distance: "2.0 km",
            is_veg: "both",
            is_pure_veg_restaurant: false,
            is_bestseller: "no"
          });
          restaurantId = newRes.id;
        }
      }

      if (!restaurantId) return res.status(400).json({ error: "Restaurant info missing" });

      const itemData = {
        name,
        description: description || "Freshly prepared",
        price: parseInt(price.toString()) * 100, // convert to cents
        image,
        category: category || "Fast Food",
        type: (category || "fast-food").toLowerCase().replace(/ /g, '-'),
        isVeg: isVeg === true || isVeg === "true",
        restaurantId
      };

      const newItem = await storage.createMenuItem(itemData);
      res.status(201).json(newItem);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create food item" });
    }
  });

  app.get("/api/food", async (req, res) => {
    try {
      const allFood = await storage.getAllMenuItemsWithRestaurants();
      res.json(allFood);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  });

  app.delete("/api/food/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.sendStatus(200);
    } catch (e) {
      res.status(500).json({ error: "Failed to delete food item" });
    }
  });

  // 1. Production Voice Assistant System
  app.post("/api/voice-assistant", async (req, res) => {
    try {
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Groq API key not configured" });
      }

      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const session = req.session as any;
      if (!session.voiceHistory) {
        session.voiceHistory = [
          {
            role: "system",
            content: `You are a food ordering assistant. 
Strictly respond only in JSON. 

Intents: 
- "search_item": User is looking for food (e.g., "I want Biryani").
- "select_restaurant": User chooses a place (e.g., "From Sai Restaurant").
- "confirm_order": User says yes/ok to add to cart.
- "set_location": User provides pincode or address.
- "unknown": Anything else.

Return JSON structure:
{
  "intent": "search_item" | "select_restaurant" | "confirm_order" | "set_location" | "unknown",
  "item": string | null,
  "restaurant": string | null,
  "location": string | null,
  "response": "A helpful voice-friendly reply"
}`
          }
        ];
      }

      session.voiceHistory.push({ role: "user", content: message });

      const client = getGroqClient();
      if (!client) {
        return res.status(500).json({ error: "Failed to initialize Groq client" });
      }

      const completion = await client.chat.completions.create({
        messages: session.voiceHistory,
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const aiResponse = completion.choices[0].message.content;
      session.voiceHistory.push({ role: "assistant", content: aiResponse });

      let parsed;
      try {
        parsed = JSON.parse(aiResponse || "{}");
      } catch (e) {
        return res.status(500).json({ error: "Invalid AI response format" });
      }

      const result: any = { ...parsed };

      // 2. Semantic Search Enhancement (Hugging Face)
      if (parsed.item && (parsed.intent === "search_item" || parsed.intent === "confirm_order")) {
        try {
          const hfKey = process.env.HUGGINGFACE_API_KEY;
          if (hfKey) {
            const allItems = await storage.getMenuItemsByName("");
            const itemNames = allItems.map(i => i.name);

            const response = await fetch(
              "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
              {
                headers: {
                  Authorization: `Bearer ${hfKey}`,
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                  inputs: {
                    source_sentence: parsed.item,
                    sentences: itemNames
                  }
                }),
                signal: AbortSignal.timeout(5000)
              }
            );

            if (response.ok) {
              const scores = await response.json();
              if (Array.isArray(scores)) {
                const matchedIndices = scores
                  .map((score, index) => ({ score, index }))
                  .filter(x => x.score > 0.5)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map(x => x.index);

                if (matchedIndices.length > 0) {
                  result.foundItems = matchedIndices.map(idx => allItems[idx]);
                }
              }
            }
          }
        } catch (semanticErr) {
          console.error("[Semantic Search Error]:", semanticErr);
        }

        // Fallback or secondary search
        if (!result.foundItems || result.foundItems.length === 0) {
          result.foundItems = await storage.getMenuItemsByName(parsed.item);
        }
      }

      if (parsed.restaurant) {
        result.foundRestaurants = await storage.getRestaurantsByName(parsed.restaurant);
      }

      if (parsed.location) {
        if (req.isAuthenticated()) {
          await storage.updateUser(req.user!.id, { address: `Pincode: ${parsed.location}` });
        }
      }

      // Action signals
      if (parsed.intent === "confirm_order") {
        if (result.foundItems && result.foundItems.length > 0) {
          result.action = "addToCart";
          result.itemToConfirm = result.foundItems[0];
        }
      }

      res.json(result);
    } catch (e) {
      console.error("[Voice AI Error]:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get(api.restaurants.list.path, async (req, res) => {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await storage.getRestaurants(offset, limit);
    res.json(data);
  });

  app.get(api.restaurants.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await storage.getRestaurant(id);
    if (!data) return res.status(404).json({ message: "Restaurant not found" });
    res.json(data);
  });

  app.get(api.restaurants.menu.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const data = await storage.getMenuByRestaurant(id);
    res.json(data);
  });

  app.get(api.recommendations.list.path, async (req, res) => {
    const data = await storage.getRecommendations();
    res.json(data);
  });

  app.get("/api/category/:type", async (req, res) => {
    const type = req.params.type;
    console.log(`[API] Fetching items for category type: ${type}`);
    try {
      const data = await storage.getMenuItemsByType(type);
      console.log(`[API] Found ${data.length} items for type: ${type}`);
      res.json(data);
    } catch (e) {
      console.error(`[API] Error fetching category ${type}:`, e);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==========================================
  // Production-Ready CSAO (Cart Super Add-On) Engine
  // ==========================================
  app.post("/api/recommendations", async (req, res) => {
    try {
      const start = Date.now();
      const { cart_item_ids } = req.body;

      if (!Array.isArray(cart_item_ids)) {
        return res.status(400).json({ error: "cart_item_ids must be an array" });
      }

      const itemIds = cart_item_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

      // 1. Fetch Item-to-Item Affinity Recommendations
      let recommendedItems = await storage.getItemAffinity(itemIds);

      // 2. Guarantee Variety: Category-based Smart Mapping (Ice Cream, Cold Drinks)
      const fallbackItems = await getFallbackRecommendations(itemIds);
      const existingIds = new Set(recommendedItems.map(i => i.id));

      // Inject fallback items interleaved with primary affinities
      let finalItems = [];
      let i = 0; let j = 0;
      while (finalItems.length < 8 && (i < recommendedItems.length || j < fallbackItems.length)) {
        if (i < recommendedItems.length) {
          finalItems.push(recommendedItems[i]);
          existingIds.add(recommendedItems[i].id);
          i++;
        }
        if (j < fallbackItems.length && finalItems.length < 8) {
          const fbItem = fallbackItems[j];
          if (!existingIds.has(fbItem.id) && !itemIds.includes(fbItem.id)) {
            finalItems.push(fbItem);
            existingIds.add(fbItem.id);
          }
          j++;
        }
      }
      recommendedItems = finalItems;

      const latency = Date.now() - start;
      console.log(`[CSAO] Recommendation Latency: ${latency}ms`);

      res.status(200).json({
        experiment_group: "affinity_system",
        latency_ms: latency,
        items: recommendedItems.slice(0, 8)
      });
    } catch (e) {
      console.error("[CSAO API Error]:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  async function getFallbackRecommendations(cartItemIds: number[]) {
    // Get all items with restaurants to ensure type matching
    const allItems = await storage.getAllMenuItemsWithRestaurants();

    if (cartItemIds.length === 0) {
      return allItems.slice(0, 8).map(item => ({ ...item, score: 0.5 }));
    }

    const cartItems = cartItemIds.map(id => allItems.find(i => i.id === id)).filter(Boolean);
    const categories = Array.from(new Set(cartItems.map(i => i!.category)));

    const categoryMapping: Record<string, string[]> = {
      "South Indian": ["Beverages", "Sweets", "Ice Cream"],
      "Biryani": ["Cold Drinks", "Sweets", "North Indian"],
      "Chinese": ["Cold Drinks", "Ice Cream"],
      "Sweets": ["Ice Cream", "Beverages"],
      "North Indian": ["Sweets", "Cold Drinks", "Ice Cream"],
      "Odia Special": ["Cold Drinks", "Ice Cream", "Sweets"],
      "Fast Food": ["Cold Drinks", "Ice Cream"],
    };

    const targetCategories = new Set<string>(categories);
    categories.forEach(cat => {
      if (categoryMapping[cat]) {
        categoryMapping[cat].forEach(c => targetCategories.add(c));
      }
    });

    // Find items in mapped complementary categories but not in cart
    return allItems
      .filter(item => targetCategories.has(item.category) && !cartItemIds.includes(item.id))
      .sort((a, b) => Number(b.restaurant.rating) - Number(a.restaurant.rating))
      .slice(0, 8)
      .map(item => ({ ...item, score: 0.3 }));
  }


  // ==========================================
  // Telemetry Event Tracking
  // ==========================================
  app.post("/api/track", async (req, res) => {
    try {
      const { pool } = await import("./db");
      if (!pool) return res.status(503).json({ error: "No DB" });

      const { user_id, cart_id, item_id, type, experiment_group } = req.body;

      if (!cart_id || !item_id || !type || !experiment_group) {
        return res.status(400).json({ error: "Missing required tracking fields" });
      }

      console.log("Tracking Insert:", { experimentGroup: experiment_group, type });

      await pool.query(
        `INSERT INTO recommendation_events (user_id, cart_id, item_id, type, experiment_group, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id || null, cart_id, item_id, type, experiment_group, new Date().toISOString()]
      );

      res.status(200).json({ success: true });
    } catch (e) {
      console.error("[Telemetry Error]:", e);
      res.status(500).json({ error: "Tracking failed" });
    }
  });

  // ==========================================
  // Analytics Endpoint
  // ==========================================
  app.get("/api/experiment-stats", async (req, res) => {
    try {
      const { pool } = await import("./db");
      if (!pool) return res.status(503).json({ error: "No DB" });

      const statsQuery = `
        SELECT 
          experiment_group,
          COUNT(CASE WHEN type = 'impression' THEN 1 END) as impressions,
          COUNT(CASE WHEN type = 'click' THEN 1 END) as clicks,
          COUNT(CASE WHEN type = 'add_to_cart' THEN 1 END) as add_to_cart
        FROM recommendation_events
        GROUP BY experiment_group
      `;
      const result = await pool.query(statsQuery);

      const stats = {
        ml_variant: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0 },
        control: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0 }
      };

      for (const row of result.rows) {
        const group = row.experiment_group as "ml_variant" | "control";
        if (group === "ml_variant" || group === "control") {
          const impressions = parseInt(row.impressions || "0", 10);
          const clicks = parseInt(row.clicks || "0", 10);
          const addToCart = parseInt(row.add_to_cart || "0", 10);

          stats[group].clicks = clicks;
          stats[group].add_to_cart = addToCart;
          stats[group].ctr = impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0;
          stats[group].attach_rate = clicks > 0 ? Number((addToCart / clicks).toFixed(4)) : 0;
        }
      }

      res.status(200).json(stats);
    } catch (e) {
      console.error("[Analytics Error]:", e);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // ==========================================
  // Analytics Summary Endpoint
  // ==========================================
  app.get("/api/experiment-summary", async (req, res) => {
    try {
      const { pool } = await import("./db");
      if (!pool) return res.status(503).json({ error: "No DB" });

      const statsQuery = `
        SELECT 
          experiment_group,
          COUNT(CASE WHEN type = 'impression' THEN 1 END) as impressions,
          COUNT(CASE WHEN type = 'click' THEN 1 END) as clicks,
          COUNT(CASE WHEN type = 'add_to_cart' THEN 1 END) as add_to_cart
        FROM recommendation_events
        GROUP BY experiment_group
      `;
      const result = await pool.query(statsQuery);

      const stats = {
        ml_variant: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0, impressions: 0 },
        control: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0, impressions: 0 }
      };

      for (const row of result.rows) {
        const group = row.experiment_group as "ml_variant" | "control";
        if (group === "ml_variant" || group === "control") {
          const impressions = parseInt(row.impressions || "0", 10);
          const clicks = parseInt(row.clicks || "0", 10);
          const addToCart = parseInt(row.add_to_cart || "0", 10);

          stats[group].impressions = impressions;
          stats[group].clicks = clicks;
          stats[group].add_to_cart = addToCart;
          stats[group].ctr = impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0;
          stats[group].attach_rate = clicks > 0 ? Number((addToCart / clicks).toFixed(4)) : 0;
        }
      }

      const ml_ctr = stats.ml_variant.ctr;
      const control_ctr = stats.control.ctr;
      const ml_attach = stats.ml_variant.attach_rate;
      const control_attach = stats.control.attach_rate;

      const ctr_uplift_percent = control_ctr > 0 ? Number((((ml_ctr - control_ctr) / control_ctr) * 100).toFixed(2)) : 0;
      const attach_rate_uplift_percent = control_attach > 0 ? Number((((ml_attach - control_attach) / control_attach) * 100).toFixed(2)) : 0;

      const winner = ml_ctr > control_ctr ? "ml_variant" : "control";

      res.status(200).json({
        winner,
        ctr_uplift_percent,
        attach_rate_uplift_percent,
        ml_variant: {
          clicks: stats.ml_variant.clicks,
          add_to_cart: stats.ml_variant.add_to_cart,
          ctr: stats.ml_variant.ctr,
          attach_rate: stats.ml_variant.attach_rate
        },
        control: {
          clicks: stats.control.clicks,
          add_to_cart: stats.control.add_to_cart,
          ctr: stats.control.ctr,
          attach_rate: stats.control.attach_rate
        }
      });
    } catch (e) {
      console.error("[Summary Error]:", e);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // Seed data only if DB is empty to prevent memory crashes on free-tier deployments
  const existingRecords = await storage.getRestaurants(0, 1);
  if (existingRecords.length === 0 || process.env.FORCE_SEED === "true") {
    seedData().catch(console.error);
  } else {
    console.log(`[API] DB already populated. Skipping heavy seed data to save memory.`);
  }

  return httpServer;
}

export async function seedData() {
  // Always clear and re-seed for Phase 2 updates
  console.log(`Ai fooder: FORCE CLEARING AND RE-SEEDING FOR PHASE 2...`);
  await storage.clearAllRestaurants();

  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune",
    "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"
  ];

  const locationsByCity: Record<string, string[]> = {
    Mumbai: ["Bandra", "Andheri", "Juhu", "Colaba", "Powai", "Worli", "Dadar"],
    Delhi: ["CP", "Hauz Khas", "Saket", "Greater Kailash", "Rohini", "Dwarka", "Karol Bagh"],
    Bangalore: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "MG Road"],
    Hyderabad: ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kukatpally"],
    Pune: ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi"],
    Chennai: ["Adyar", "T. Nagar", "Velachery", "Mylapore", "Anna Nagar"],
    Kolkata: ["Park Street", "Salt Lake", "New Town", "Ballygunge", "Gariahat"],
    Ahmedabad: ["SG Highway", "Prahlad Nagar", "Navrangpura", "Satellite"],
    Jaipur: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Raja Park"],
    Lucknow: ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aliganj"]
  };

  const cuisinesByCity: Record<string, string[]> = {
    Mumbai: ["Street Food", "Maharashtrian", "Coastal", "Pizza & Italian", "Cafe", "Burgers & Cafe"],
    Delhi: ["North Indian", "Mughlai", "Street Food", "Bakery", "Chinese", "Pizza & Italian"],
    Bangalore: ["South Indian", "Cafe", "Brewery", "Continental", "Healthy Food", "Burgers & Cafe"],
    Hyderabad: ["Biryani", "Andhra", "Nizam", "Desserts", "Cafe", "Tandoori & Grills"],
    Pune: ["Maharashtrian", "Bakery", "Modern Indian", "Italian", "Bar Food", "Pizza & Italian"],
    Chennai: ["Tamilian", "Chettinad", "South Indian", "Chinese", "Seafood", "Desi Chinese"],
    Kolkata: ["Bengali", "Sweets", "Street Food", "Chinese", "Awadhi", "Indian Sweets"],
    Ahmedabad: ["Gujarati", "Thali", "Street Food", "Fast Food", "North Indian", "Pizza & Italian"],
    Jaipur: ["Rajasthani", "Thali", "Street Food", "Cafe", "Mughlai", "Tandoori & Grills"],
    Lucknow: ["Awadhi", "Kabab", "Lakhnawi", "Lucknowi", "Mughlai", "Biryani Special"]
  };

  console.log("Starting master dataset seeding...");
  const foodMap = new Map(foodData.map(item => [item.id, item]));

  for (const r of restaurantData) {
    const restaurant = await storage.createRestaurant({
      name: r.name,
      image: r.image,
      rating: r.rating,
      delivery_time: r.deliveryTime,
      cuisine: r.category,
      price_range: "₹₹",
      location: "Cuttack, Odisha",
      distance: "2.5 km",
      is_veg: r.category === "Sweets" || r.category === "Odia Special" || r.category === "Ice Cream" || r.category === "Cold Drinks" ? "veg" : "both",
      is_pure_veg_restaurant: r.category === "Sweets" || r.category === "Odia Special" || r.category === "Ice Cream" || r.category === "Cold Drinks",
      is_bestseller: Number(r.rating) >= 4.7 ? "yes" : "no",
    });

    for (const foodId of r.menu) {
      const item = foodMap.get(foodId);
      if (!item) continue;

      await storage.createMenuItem({
        restaurantId: restaurant.id,
        name: item.name,
        description: item.description,
        price: item.price * 100,
        image: item.image,
        category: item.category,
        isVeg: item.isVeg,
        isPureVeg: item.isVeg && (item.category === "Sweets" || item.cuisine === "Odia"),
        type: item.category.toLowerCase().replace(/ /g, '-'),
        cuisineType: item.cuisine
      });
    }
  }

  const recs = [
    { name: "Extra Cheese", price: 50, image: "https://images.unsplash.com/photo-1481070555726-e2fe83477d15?w=500&q=80" },
    { name: "Garlic Bread", price: 120, image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80" },
    { name: "Coke 500ml", price: 60, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80" },
    { name: "Chocolate Brownie", price: 150, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
    { name: "Potato Wedges", price: 110, image: "https://images.unsplash.com/photo-1573080496597-1a40ecda99fe?w=500&q=80" }
  ];

  for (const rec of recs) {
    await storage.createRecommendation({
      name: rec.name,
      price: rec.price * 100,
      image: rec.image
    });
  }

  // Seed Item Affinity Data (Complementary Items)
  console.log("Seeding item affinity data...");
  const allGeneratedItems = await storage.getAllMenuItemsWithRestaurants();

  // Logic to pair items cross-category (e.g., Biryani -> Cold Drink, Fast Food -> Cold Drink)
  for (const item of allGeneratedItems) {
    if (item.category === "Biryani" || item.category === "North Indian" || item.category === "Fast Food") {
      // Find a cold drink
      const coldDrink = allGeneratedItems.find(i => i.category === "Cold Drinks");
      if (coldDrink) {
        await storage.createItemAffinity({
          baseItemId: item.id,
          recommendedItemId: coldDrink.id,
          score: 150
        });
      }

      // Find an ice cream
      const iceCream = allGeneratedItems.find(i => i.category === "Ice Cream");
      if (iceCream) {
        await storage.createItemAffinity({
          baseItemId: item.id,
          recommendedItemId: iceCream.id,
          score: 120
        });
      }
    }
  }

  console.log(`Master seeding complete! Added ${restaurantData.length} restaurants and ${foodData.length} food items.`);
}
