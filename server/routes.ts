import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.restaurants.list.path, async (req, res) => {
    const data = await storage.getRestaurants();
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

  // Self-invoking seed for demo
  seedData().catch(console.error);

  return httpServer;
}

async function seedData() {
  const existing = await storage.getRestaurants();
  if (existing.length > 0) return;

  const cuisines = ["Indian", "Chinese", "Italian", "Fast Food", "Desserts", "Beverages"];
  const categories = ["Main Course", "Biryani", "Starters", "Desserts", "Beverages"];
  
  console.log("Seeding database with demo data...");

  // Seed 400 restaurants (looping for brevity in this example code block, 
  // normally would use bulk insert for 400 records but keeping it simple for now)
  for (let i = 1; i <= 400; i++) {
    const cuisine = cuisines[i % cuisines.length];
    const restaurant = await storage.createRestaurant({
      name: `${cuisine} Delight ${i}`,
      image: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80`,
      rating: (3.5 + Math.random() * 1.3).toFixed(1),
      deliveryTime: `${20 + Math.floor(Math.random() * 40)} mins`,
      cuisine,
      priceRange: i % 2 === 0 ? "₹₹" : "₹₹₹",
    });

    // 10 items per restaurant
    for (let j = 1; j <= 10; j++) {
      await storage.createMenuItem({
        restaurantId: restaurant.id,
        name: `Item ${j} from ${restaurant.name}`,
        description: "Deliciously prepared with fresh ingredients and authentic spices.",
        price: 15000 + Math.floor(Math.random() * 45000), // in cents
        image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80`,
        category: categories[j % categories.length],
      });
    }
  }

  // Seed recommendations
  for (let k = 1; k <= 5; k++) {
    await storage.createRecommendation({
      name: `Special Side ${k}`,
      price: 8000 + Math.floor(Math.random() * 5000),
      image: `https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&q=80`
    });
  }

  console.log("Seeding complete!");
}
