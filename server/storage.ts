import { db } from "./db";
import {
  restaurants,
  menuItems,
  recommendations,
  type Restaurant,
  type MenuItem,
  type Recommendation,
  type InsertRestaurant,
  type InsertMenuItem,
  type InsertRecommendation
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getRecommendations(): Promise<Recommendation[]>;
  
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
}

export class DatabaseStorage implements IStorage {
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const [res] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return res;
  }

  async getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return await db.select().from(recommendations);
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [res] = await db.insert(restaurants).values(restaurant).returning();
    return res;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [res] = await db.insert(menuItems).values(menuItem).returning();
    return res;
  }

  async createRecommendation(rec: InsertRecommendation): Promise<Recommendation> {
    const [res] = await db.insert(recommendations).values(rec).returning();
    return res;
  }
}

export const storage = new DatabaseStorage();
