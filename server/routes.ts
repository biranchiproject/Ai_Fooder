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
import multer from "multer";
import fs from "fs";

// Configure Multer for local storage
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

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
let onnxLoadFailed = false;
const ONNX_MIN_SIZE_BYTES = 50_000; // 50KB minimum to detect failed exports

async function initONNX() {
  const modelPath = path.join(process.cwd(), "server", "model.onnx");

  // === PHASE 5: STARTUP VALIDATION — FAIL FAST IF MODEL IS INVALID ===
  try {
    const { statSync } = await import("fs");
    const stat = statSync(modelPath);
    const fileSizeBytes = stat.size;
    const fileSizeKB = (fileSizeBytes / 1024).toFixed(1);

    if (fileSizeBytes < ONNX_MIN_SIZE_BYTES) {
      console.error(`[ONNX STARTUP] ❌ CRITICAL: model.onnx is only ${fileSizeKB} KB (< 50KB threshold).`);
      console.error(`[ONNX STARTUP] This indicates a failed export. ML variant will NOT be served.`);
      console.error(`[ONNX STARTUP] Run: cd ml && python train_ranker.py to regenerate.`);
      onnxLoadFailed = true;
      return;
    }

    console.log(`[ONNX STARTUP] File found: ${modelPath} | Size: ${fileSizeKB} KB`);
    onnxSession = await ort.InferenceSession.create(modelPath);
    console.log(`[ONNX STARTUP] ✅ ONNX model loaded successfully | Size: ${fileSizeKB} KB | Inputs: ${onnxSession.inputNames} | Outputs: ${onnxSession.outputNames}`);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      console.error(`[ONNX STARTUP] ❌ model.onnx NOT FOUND at: ${modelPath}`);
      console.error(`[ONNX STARTUP] Run: cd ml && python train_ranker.py to generate.`);
    } else {
      console.error("[ONNX STARTUP] ❌ Failed to load ONNX model:", e.message);
    }
    onnxLoadFailed = true;
  }
}
initONNX();

// ============================================================
// Auto-Migration: Add new columns if they don't exist yet
// Runs safely at startup — skips if columns already present
// ============================================================
async function runMigrations() {
  try {
    const { pool } = await import("./db");
    if (!pool) return;
    await pool.query(`
      ALTER TABLE recommendation_events
        ADD COLUMN IF NOT EXISTS order_value INTEGER,
        ADD COLUMN IF NOT EXISTS cart_value INTEGER;
    `);
    console.log("[DB MIGRATION] ✅ recommendation_events columns verified/added (order_value, cart_value).");
  } catch (e: any) {
    // Non-fatal: server continues even if migration fails (e.g. no DB connection)
    console.warn("[DB MIGRATION] ⚠️ Could not run migration:", e.message);
  }
}
runMigrations();

// ============================================================
// Image Path Fix Migration
// DB was seeded before data.ts image paths were corrected.
// This updates all affected menu items in-place at startup.
// ============================================================
async function fixImagePaths() {
  try {
    const { pool } = await import("./db");
    if (!pool) return;

    // Map of exact item name → correct local image path
    const IMAGE_FIXES: Record<string, string> = {
      // Sweets - Odia
      "Rasagola": "/assets/food/sweets/rasagola.png",
      "Chhena Poda": "/assets/food/sweets/chhena-poda.png",
      "Chhena Jhili": "/assets/food/sweets/chhena-jhili.png",
      "Rasabali": "/assets/food/sweets/rasabali.png",
      "Khaja": "/assets/food/sweets/khaja.png",
      "Arisa Pitha": "/assets/food/sweets/arisa-pitha.png",
      "Manda Pitha": "/assets/food/sweets/manda-pitha.png",
      "Kakara Pitha": "/assets/food/sweets/kakara-pitha.png",
      "Malpua": "/assets/food/sweets/malpua.png",
      "Rabdi": "/assets/food/sweets/rabdi.png",
      // Biryani
      "Hyderabadi Chicken Biryani": "/assets/food/biryani/hyderabadi.png",
      "Lucknowi (Awadhi) Biryani": "/assets/food/biryani/lucknowi.png",
      "Kolkata Biryani": "/assets/food/biryani/kolkata.png",
      "Malabar Biryani": "/assets/food/biryani/malabar.png",
      "Thalassery Biryani": "/assets/food/biryani/thalassery.png",
      "Dindigul Biryani": "/assets/food/biryani/hyderabadi.png",
      "Sindhi Biryani": "/assets/food/biryani/bombay.png",
      "Bombay Biryani": "/assets/food/biryani/bombay.png",
      "Ambur Biryani": "/assets/food/biryani/ambur.png",
      "Bhatkali Biryani": "/assets/food/biryani/hyderabadi.png",
      // Cold Drinks
      "Coca Cola": "/assets/food/cold-drinks/coca-cola.png",
      "Pepsi": "/assets/food/cold-drinks/pepsi.png",
      "Sprite": "/assets/food/cold-drinks/sprite.png",
      "Thums Up": "/assets/food/cold-drinks/thums-up.png",
      "Fanta": "/assets/food/cold-drinks/fanta.png",
      "Mountain Dew": "/assets/food/cold-drinks/mountain-dew.png",
      "Limca": "/assets/food/cold-drinks/limca.png",
      "7UP": "/assets/food/cold-drinks/7up.png",
      "Mirinda": "/assets/food/cold-drinks/mirinda.png",
      "Appy Fizz": "/assets/food/cold-drinks/appy-fizz.png",
      // Ice Cream
      "Vanilla Ice Cream": "/assets/food/ice-cream/vanilla-ice-cream.png",
      "Chocolate Ice Cream": "/assets/food/ice-cream/chocolate-ice-cream.png",
      "Strawberry Ice Cream": "/assets/food/ice-cream/strawberry-ice-cream.png",
      "Butterscotch Ice Cream": "/assets/food/ice-cream/butterscotch-ice-cream.png",
      "Black Currant Ice Cream": "/assets/food/ice-cream/black-currant-ice-cream.png",
      "Mango Ice Cream": "/assets/food/ice-cream/mango-ice-cream.png",
      "Chocolate Chip Ice Cream": "/assets/food/ice-cream/chocolate-chip-ice-cream.png",
      "Kesar Pista Ice Cream": "/assets/food/ice-cream/kesar-pista-ice-cream.png",
      "Oreo Ice Cream": "/assets/food/ice-cream/oreo-ice-cream.png",
      "Tutti Frutti Ice Cream": "/assets/food/ice-cream/tutti-frutti-ice-cream.png",
      // Odia Special
      "Chakuli & Matar Curry": "/assets/food/odia-special/chakuli.png",
      "Pakhala Bhata & Sabji": "/assets/food/odia-special/pakhala.png",
      "Macha Curry": "/assets/food/odia-special/macha.png",
      "Chugudi Tarkari": "/assets/food/odia-special/chugudi.png",
      "Sujji Haluwa": "/assets/food/odia-special/haluwa.png",
      "Chicken Biryani": "/assets/food/odia-special/chicken-biryani.png",
      "Mutton Biryani": "/assets/food/odia-special/mutton-biryani.png",
      "Handi Biryani": "/assets/food/odia-special/handi-biryani.png",
      "Chicken Tandoori": "/assets/food/odia-special/tandoori.png",
      "Chicken Kebab": "/assets/food/odia-special/kebab.png",
    };


    let fixedCount = 0;
    for (const [name, correctPath] of Object.entries(IMAGE_FIXES)) {
      const result = await pool.query(
        `UPDATE menu_items SET image = $1 WHERE name = $2 AND image != $1`,
        [correctPath, name]
      );
      fixedCount += result.rowCount || 0;
    }

    if (fixedCount > 0) {
      console.log(`[IMAGE FIX] ✅ Updated ${fixedCount} menu item image paths to correct local assets.`);
    } else {
      console.log(`[IMAGE FIX] ✅ All menu item image paths are already correct.`);
    }
  } catch (e: any) {
    console.warn("[IMAGE FIX] ⚠️ Could not fix image paths:", e.message);
  }
}
fixImagePaths();


function getExperimentGroup(userId: number | undefined): "control" | "ml_variant" {
  if (!userId) return Math.random() < 0.5 ? "control" : "ml_variant";
  const hash = crypto.createHash("md5").update(userId.toString()).digest("hex");
  const bucket = parseInt(hash.substring(0, 8), 16) % 100;
  return bucket < 50 ? "control" : "ml_variant";
}

async function trackEventAsync(event: any) {
  // Fire and forget: process in next tick to maintain low client latency
  setImmediate(async () => {
    try {
      const { pool } = await import("./db");
      if (!pool) return;
      try {
        // Try full insert with AOV columns
        await pool.query(
          `INSERT INTO recommendation_events
           (user_id, cart_id, item_id, type, experiment_group, order_value, cart_value, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            event.user_id || null,
            event.cart_id,
            event.item_id,
            event.type,
            event.experiment_group,
            event.order_value || null,   // Phase 4: AOV telemetry
            event.cart_value || null,    // Phase 4: cart value at time of event
            new Date().toISOString()
          ]
        );
      } catch (insertErr: any) {
        // If new columns don't exist yet (42703 = undefined_column), fallback to old schema
        if (insertErr.code === '42703') {
          console.warn("[Tracking] order_value/cart_value columns missing, using fallback insert. Run DB migration.");
          await pool.query(
            `INSERT INTO recommendation_events (user_id, cart_id, item_id, type, experiment_group, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [event.user_id || null, event.cart_id, event.item_id, event.type, event.experiment_group, new Date().toISOString()]
          );
        } else {
          throw insertErr;
        }
      }
    } catch (e) {
      console.error("[Async Tracking Error]:", e);
    }
  });
}

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
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ url: filePath });
    } catch (e) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/admin/:id/food", requireSuperAdmin, async (req, res) => {
    try {
      const adminId = parseInt(req.params.id);
      const restaurant = await storage.getRestaurantByOwner(adminId);
      if (!restaurant) return res.json([]);
      const menu = await storage.getMenuByRestaurant(restaurant.id);
      res.json(menu.map(item => ({ ...item, restaurant })));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch admin food items" });
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

  app.get("/api/my-restaurant", requireAdmin, async (req, res) => {
    try {
      const restaurant = await storage.getRestaurantByOwner(req.user!.id);
      res.json(restaurant || null);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/my-restaurant", requireAdmin, async (req, res) => {
    try {
      const existing = await storage.getRestaurantByOwner(req.user!.id);
      if (existing) {
        const updated = await storage.updateRestaurant(existing.id, req.body);
        return res.json(updated);
      }

      const restaurant = await storage.createRestaurant({
        ...req.body,
        ownerId: req.user!.id,
        rating: "4.5",
        delivery_time: "30-40 min",
        distance: "2.0 km",
        is_veg: req.body.is_veg || "both",
        is_pure_veg_restaurant: req.body.is_pure_veg_restaurant || false,
        is_bestseller: "no",
        is_open: true,
        is_new: true,
      });
      res.status(201).json(restaurant);
    } catch (e) {
      res.status(500).json({ error: "Failed to manage restaurant profile" });
    }
  });

  app.post("/api/food", requireAdmin, async (req, res) => {
    try {
      let { restaurantId, hotelName, location, name, price, image, category, description, isVeg } = req.body;

      // For admins, force the restaurantId to be their own
      if (req.user!.role === "admin") {
        const myRes = await storage.getRestaurantByOwner(req.user!.id);
        if (!myRes) {
          return res.status(403).json({ error: "You must create a restaurant profile first" });
        }
        restaurantId = myRes.id;
      }

      if (!restaurantId && hotelName && req.user!.role === "superadmin") {
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
      if (req.isAuthenticated() && req.user!.role === "admin") {
        const myRes = await storage.getRestaurantByOwner(req.user!.id);
        if (!myRes) return res.json([]);
        const menu = await storage.getMenuByRestaurant(myRes.id);
        // Map to include restaurant info for consistency
        return res.json(menu.map(item => ({ ...item, restaurant: myRes })));
      }
      const allFood = await storage.getAllMenuItemsWithRestaurants();
      res.json(allFood);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  });

  app.delete("/api/food/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (req.user!.role === "admin") {
        const myRes = await storage.getRestaurantByOwner(req.user!.id);
        const item = await storage.getMenuItem(id);
        if (!myRes || !item || item.restaurantId !== myRes.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

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
  // Search API
  // ==========================================
  app.get("/api/search", async (req, res) => {
    try {
      const q = (req.query.q as string || "").trim();
      if (q.length < 2) {
        return res.json({ items: [], restaurants: [] });
      }

      const [items, rests] = await Promise.all([
        storage.getMenuItemsByName(q),
        storage.getRestaurantsByName(q),
      ]);

      res.json({
        items: items.slice(0, 8),
        restaurants: rests.slice(0, 5),
      });
    } catch (e) {
      console.error("[Search Error]:", e);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ==========================================
  // Production-Ready CSAO (Cart Super Add-On) Engine
  // Context-Aware, Real-Time, ML-Powered
  // ==========================================

  // Category encoding map (must match LabelEncoder from training)
  const CATEGORY_ENCODING: Record<string, number> = {
    "Biryani": 0, "Biryani Special": 0,
    "Burgers & Cafe": 1,
    "Chinese": 2,
    "Cold Drinks": 3,
    "Fast Food": 4,
    "Ice Cream": 5,
    "North Indian": 6,
    "Odia Special": 7,
    "Pizza & Italian": 8,
    "South Indian": 9,
    "Sweets": 10,
    "Beverages": 11,
  };

  // Meal-completion chains: ordered progression of complementary items
  const MEAL_CHAINS: Record<string, string[]> = {
    "Biryani": ["North Indian", "Sweets", "Cold Drinks", "Ice Cream"],
    "North Indian": ["Sweets", "Cold Drinks", "Ice Cream"],
    "South Indian": ["Beverages", "Sweets", "Ice Cream"],
    "Chinese": ["Cold Drinks", "Ice Cream", "Sweets"],
    "Fast Food": ["Cold Drinks", "Ice Cream"],
    "Pizza & Italian": ["Cold Drinks", "Ice Cream", "Sweets"],
    "Odia Special": ["Cold Drinks", "Sweets", "Ice Cream"],
    "Sweets": ["Ice Cream", "Beverages", "Cold Drinks"],
    "Ice Cream": ["Cold Drinks", "Beverages"],
    "Cold Drinks": ["Ice Cream", "Sweets"],
    "Beverages": ["Sweets", "Ice Cream"],
  };

  // Time-of-day category boosts
  const TIME_BOOSTS: Record<string, string[]> = {
    morning: ["South Indian", "Beverages", "Sweets"],        // 6-11
    afternoon: ["Biryani", "North Indian", "Cold Drinks"],      // 12-16
    evening: ["Fast Food", "Chinese", "Cold Drinks"],         // 17-20
    night: ["Ice Cream", "Sweets", "Cold Drinks"],          // 21-5
  };

  function getTimeSlot(hour: number): string {
    if (hour >= 6 && hour <= 11) return "morning";
    if (hour >= 12 && hour <= 16) return "afternoon";
    if (hour >= 17 && hour <= 20) return "evening";
    return "night";
  }

  app.post("/api/recommendations", async (req, res) => {
    try {
      const start = Date.now();
      const { cart_item_ids, user_id, hour_of_day, day_of_week } = req.body;

      if (!Array.isArray(cart_item_ids)) {
        return res.status(400).json({ error: "cart_item_ids must be an array" });
      }

      const itemIds = cart_item_ids.map((id: any) => parseInt(id, 10)).filter((id: number) => !isNaN(id));
      const hour = typeof hour_of_day === "number" ? hour_of_day : new Date().getHours();
      const dow = typeof day_of_week === "number" ? day_of_week : new Date().getDay();

      // 0. A/B Testing & Context
      const experimentGroup = getExperimentGroup(user_id);
      let city = "Mumbai";
      if (user_id) {
        const user = await storage.getUser(user_id);
        if (user?.address?.includes("Mumbai")) city = "Mumbai";
        else if (user?.address?.includes("Delhi")) city = "Delhi";
        else if (user?.address?.includes("Bhubaneswar") || user?.address?.includes("Bhubaneswar")) city = "Bhubaneswar";
        else if (user?.address?.includes("Bangalore")) city = "Bangalore";
        else if (user?.address?.includes("Chennai")) city = "Chennai";
        else if (user?.address?.includes("Kolkata")) city = "Kolkata";
      }

      // Smart cache key includes city and experiment group
      const cacheKey = crypto.createHash("md5")
        .update(JSON.stringify({ ids: itemIds.sort(), city, hour: Math.floor(hour / 4), dow, experimentGroup }))
        .digest("hex");

      const cached = recsCache.get(cacheKey);
      if (cached) {
        const latency = Date.now() - start;
        console.log(`[CSAO] Cache HIT | Latency: ${latency}ms | Group: ${experimentGroup}`);
        return res.status(200).json({ ...cached, latency_ms: latency, cached: true });
      }

      // 1. Candidate Retrieval (Stage 1)
      let candidates: (any & { restaurant: any })[] = [];
      const timeSlot = getTimeSlot(hour);
      let cartValue = 0;

      if (itemIds.length > 0) {
        const cartItemsFull = await Promise.all(
          itemIds.map(id => storage.getAllMenuItemsWithRestaurants().then(all => all.find(i => i.id === id)))
        );
        const cartCategoryList = Array.from(new Set(cartItemsFull.filter(Boolean).map(i => i!.category)));
        cartValue = cartItemsFull.filter(Boolean).reduce((sum, i) => sum + (i!.price || 0), 0);

        // Fetch candidates based on meal-chain affinity + city
        const targetCategories = new Set<string>();
        cartCategoryList.forEach(cat => (MEAL_CHAINS[cat] || []).forEach(tc => targetCategories.add(tc)));

        candidates = await storage.getCandidates({
          city,
          categories: Array.from(targetCategories),
          priceMax: (cartValue / 100) * 0.5 + 200, // Dynamic price band
          excludeIds: itemIds,
          limit: 200
        });

        console.log(`[CSAO] Stage 1 Retrieved: ${candidates.length} candidates | Cart: [${cartCategoryList.join(", ")}] | City: ${city}`);

        // Cold Start Fallback for new carts or low candidate yield
        if (candidates.length < 20) {
          console.log(`[CSAO] Cold start fallback triggered (< 20 candidates). Fetching popular items.`);
          const fallback = await storage.getPopularItems({ city, limit: 50 });
          candidates = [...candidates, ...fallback.filter(f => !itemIds.includes(f.id))];
          console.log(`[CSAO] After fallback: ${candidates.length} candidates`);
        }
      } else {
        // Cold Start: Empty Cart / New User
        candidates = await storage.getPopularItems({ city, limit: 100 });
        console.log(`[CSAO] Cold start (empty cart): ${candidates.length} popular items | City: ${city}`);
      }

      // 2. Ranking (Stage 2) — ONNX ML Inference
      let scoredItems: { item: any; score: number }[] = [];
      let rankingMethod = "heuristic";

      if (experimentGroup === "ml_variant" && onnxSession && candidates.length > 0) {
        try {
          console.log(`[CSAO ML] Running ONNX inference on ${candidates.length} candidates...`);

          const featureVectors: number[][] = candidates.map(item => [
            item.id,
            CATEGORY_ENCODING[item.category] ?? 6,
            (item.price || 0) / 100,
            itemIds.length,
            cartValue / 100,              // Phase 2: use real cart value
            hour,
            dow
          ]);

          const flatFeatures = new Float32Array(featureVectors.flat());
          const inputTensor = new ort.Tensor("float32", flatFeatures, [candidates.length, 7]);
          const feeds: Record<string, ort.Tensor> = { [onnxSession.inputNames[0]]: inputTensor };
          const mlStart = Date.now();
          const results = await onnxSession.run(feeds);
          const mlLatency = Date.now() - mlStart;
          const outputData = results[onnxSession.outputNames[0]].data as Float32Array;

          scoredItems = candidates.map((item, idx) => ({ item, score: outputData[idx] || 0 }));
          rankingMethod = "onnx_ml";

          // Phase 2: Log sample ML scores
          const sampleScores = Array.from(outputData).slice(0, 5).map(s => s.toFixed(4));
          console.log(`[CSAO ML] ✅ ONNX inference complete | Latency: ${mlLatency}ms | Candidates scored: ${candidates.length} | Sample scores: [${sampleScores.join(", ")}]`);
        } catch (mlError: any) {
          console.error(`[CSAO ML] ❌ ONNX inference failed, falling back to heuristics: ${mlError.message}`);
          rankingMethod = "heuristic_fallback_onnx_error";
        }
      } else if (experimentGroup === "ml_variant" && onnxLoadFailed) {
        console.warn(`[CSAO ML] ⚠️ ml_variant requested but ONNX model failed to load. Reason: startup validation failed. Using heuristics.`);
        rankingMethod = "heuristic_fallback_load_failed";
      } else if (experimentGroup === "control") {
        console.log(`[CSAO] Group: control — using heuristic ranking.`);
        rankingMethod = "heuristic_control";
      }

      // Initialize scores if ML didn't run
      if (scoredItems.length === 0) {
        scoredItems = candidates.map(item => ({ item, score: 0.1 }));
      }

      // Hybrid boosts (Meal-chains, Time, Affinity)
      const affinityItems = await storage.getItemAffinity(itemIds);
      const affinityIds = new Set(affinityItems.map(a => a.id));
      const timeBoosted = new Set(TIME_BOOSTS[timeSlot] || []);

      for (const entry of scoredItems) {
        const cat = entry.item.category;
        if (affinityIds.has(entry.item.id)) entry.score += 0.4;
        if (timeBoosted.has(cat)) entry.score += 0.2;

        // Epsilon-Greedy Exploration (5%)
        if (Math.random() < 0.05) {
          entry.score += Math.random() * 0.5;
        }
      }

      scoredItems.sort((a, b) => b.score - a.score);
      const topItems = scoredItems.slice(0, 8).map(e => ({ ...e.item, score: e.score.toFixed(4) }));

      const latency = Date.now() - start;
      console.log(`[CSAO] ✅ Done | Latency: ${latency}ms | Candidates: ${candidates.length} | Group: ${experimentGroup} | Ranking: ${rankingMethod} | Top: ${topItems.length}`);

      if (latency > 300) {
        console.warn(`[CSAO PERF] ⚠️ Latency ${latency}ms exceeded 300ms budget. Consider warming cache or optimizing DB queries.`);
      }

      const result = {
        experiment_group: experimentGroup,
        latency_ms: latency,
        ranking_method: rankingMethod,
        candidate_count: candidates.length,
        items: topItems,
        context: { city, time_slot: timeSlot }
      };

      recsCache.set(cacheKey, result);
      res.status(200).json(result);
    } catch (e) {
      console.error("[CSAO API Error]:", e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user's most-ordered categories from order history
  async function getUserPreferredCategories(userId: number): Promise<string[]> {
    try {
      const { pool } = await import("./db");
      if (!pool) return [];

      const result = await pool.query(
        `SELECT mi.category, COUNT(*) as cnt
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN menu_items mi ON mi.id = oi.item_id
         WHERE o.user_id = $1
         GROUP BY mi.category
         ORDER BY cnt DESC
         LIMIT 5`,
        [userId]
      );
      return result.rows.map((r: any) => r.category);
    } catch {
      return [];
    }
  }


  // ==========================================
  // Telemetry Event Tracking — Phase 4: AOV
  // ==========================================
  app.post("/api/track", async (req, res) => {
    const { user_id, cart_id, item_id, type, experiment_group, order_value, cart_value } = req.body;
    if (!cart_id || !item_id || !type || !experiment_group) {
      return res.status(400).json({ error: "Missing required tracking fields" });
    }

    // Enrich the event object with AOV fields before async write
    const enrichedEvent = {
      user_id,
      cart_id,
      item_id,
      type,
      experiment_group,
      order_value: order_value ?? null,   // Phase 4: total order value at checkout
      cart_value: cart_value ?? null,     // Phase 4: cart subtotal at click time
    };

    // Fire and forget for low latency client response
    trackEventAsync(enrichedEvent);

    res.status(200).json({ success: true, queued: true });
  });

  // ==========================================
  // Analytics Endpoint — Phase 4: AOV aggregation
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
          COUNT(CASE WHEN type = 'add_to_cart' THEN 1 END) as add_to_cart,
          COUNT(CASE WHEN type = 'checkout' THEN 1 END) as checkouts,
          AVG(CASE WHEN type = 'checkout' AND order_value IS NOT NULL THEN order_value END) as avg_order_value,
          SUM(CASE WHEN type = 'checkout' AND order_value IS NOT NULL THEN order_value END) as total_revenue,
          AVG(CASE WHEN cart_value IS NOT NULL THEN cart_value END) as avg_cart_value
        FROM recommendation_events
        GROUP BY experiment_group
      `;
      const result = await pool.query(statsQuery);

      const stats: Record<string, any> = {
        ml_variant: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0, avg_order_value: 0, total_revenue: 0, avg_cart_value: 0, checkouts: 0 },
        control: { clicks: 0, add_to_cart: 0, ctr: 0, attach_rate: 0, avg_order_value: 0, total_revenue: 0, avg_cart_value: 0, checkouts: 0 }
      };

      for (const row of result.rows) {
        const group = row.experiment_group as "ml_variant" | "control";
        if (group === "ml_variant" || group === "control") {
          const impressions = parseInt(row.impressions || "0", 10);
          const clicks = parseInt(row.clicks || "0", 10);
          const addToCart = parseInt(row.add_to_cart || "0", 10);
          const checkouts = parseInt(row.checkouts || "0", 10);
          const avgOrderValue = parseFloat(row.avg_order_value || "0");
          const totalRevenue = parseFloat(row.total_revenue || "0");
          const avgCartValue = parseFloat(row.avg_cart_value || "0");

          stats[group].impressions = impressions;
          stats[group].clicks = clicks;
          stats[group].add_to_cart = addToCart;
          stats[group].checkouts = checkouts;
          stats[group].ctr = impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0;
          stats[group].attach_rate = clicks > 0 ? Number((addToCart / clicks).toFixed(4)) : 0;
          stats[group].avg_order_value = Number(avgOrderValue.toFixed(2));
          stats[group].total_revenue = Number(totalRevenue.toFixed(2));
          stats[group].avg_cart_value = Number(avgCartValue.toFixed(2));
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
        ml_variant: stats.ml_variant,
        control: stats.control,
        meta: {
          timestamp: new Date().toISOString(),
          two_stage_enabled: true
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

  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      res.json(updatedUser);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

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
      location: r.city || "Mumbai",
      city: r.city || "Mumbai",
      distance: "2.5 km",
      is_veg: r.category === "Sweets" || r.category === "Odia Special" || r.category === "Ice Cream" || r.category === "Cold Drinks" ? "veg" : "both",
      is_pure_veg_restaurant: r.category === "Sweets" || r.category === "Odia Special" || r.category === "Ice Cream" || r.category === "Cold Drinks",
      is_bestseller: Number(r.rating) >= 4.7 ? "yes" : "no",
      is_open: true,
      is_new: Math.random() < 0.2, // Simulate some new restaurants
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
        cuisineType: item.cuisine,
        is_new: Math.random() < 0.1
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
