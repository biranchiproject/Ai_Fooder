import { db, pool } from "./db";
import session from "express-session";
import MemoryStore from "memorystore";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);
const MemorySessionStore = MemoryStore(session);
import {
  restaurants,
  menuItems,
  recommendations,
  type Restaurant,
  type MenuItem,
  type Recommendation,
  type InsertRestaurant,
  type InsertMenuItem,
  type InsertRecommendation,
  users,
  type User,
  type InsertUser,
  itemAffinity,
  type ItemAffinity,
  type InsertItemAffinity,
} from "@shared/schema";
import { eq, ilike, inArray, notInArray, and, ne, desc } from "drizzle-orm";

export interface IStorage {
  getRestaurants(offset?: number, limit?: number): Promise<Restaurant[]>;
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getRecommendations(): Promise<Recommendation[]>;
  getAllMenuItemsWithRestaurants(): Promise<(MenuItem & { restaurant: Restaurant })[]>;
  getMenuItemsByType(type: string): Promise<(MenuItem & { restaurant: Restaurant })[]>;
  getMenuItemsByName(name: string): Promise<MenuItem[]>;
  getRestaurantsByName(name: string): Promise<Restaurant[]>;
  getItemAffinity(itemIds: number[]): Promise<(MenuItem & { restaurant: Restaurant })[]>;

  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  createRecommendation(rec: InsertRecommendation): Promise<Recommendation>;
  createItemAffinity(affinity: InsertItemAffinity): Promise<ItemAffinity>;
  clearAllRestaurants(): Promise<void>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteMenuItem(id: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool as any,
      createTableIfMissing: true,
    });
  }

  async getRestaurants(offset = 0, limit = 20): Promise<Restaurant[]> {
    return await db.select()
      .from(restaurants)
      .limit(limit)
      .offset(offset)
      .orderBy(restaurants.id);
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

  async getAllMenuItemsWithRestaurants(): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    const results = await db.select({
      menuItem: menuItems,
      restaurant: restaurants,
    })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id));

    return results.map((r: any) => ({ ...r.menuItem, restaurant: r.restaurant }));
  }

  async getMenuItemsByType(type: string): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    const results = await db.select({
      menuItem: menuItems,
      restaurant: restaurants,
    })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(eq(menuItems.type, type));

    return results.map((r: any) => ({ ...r.menuItem, restaurant: r.restaurant }));
  }

  async getMenuItemsByName(name: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(ilike(menuItems.name, `%${name}%`));
  }

  async getRestaurantsByName(name: string): Promise<Restaurant[]> {
    return await db.select().from(restaurants).where(ilike(restaurants.name, `%${name}%`));
  }

  async getItemAffinity(itemIds: number[]): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    if (itemIds.length === 0) return [];

    // Fetch recommended item IDs based on cart items, excluding items already in cart
    const affinities = await db.select({
      recommendedId: itemAffinity.recommendedItemId,
    })
      .from(itemAffinity)
      .where(and(
        inArray(itemAffinity.baseItemId, itemIds),
        notInArray(itemAffinity.recommendedItemId, itemIds)
      ))
      .orderBy(desc(itemAffinity.score))
      .limit(20);

    const recIds = affinities
      .map((a: { recommendedId: number }) => a.recommendedId)
      .filter((id: number) => !itemIds.includes(id));

    if (recIds.length === 0) return [];

    const results = await db.select({
      menuItem: menuItems,
      restaurant: restaurants,
    })
      .from(menuItems)
      .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
      .where(inArray(menuItems.id, recIds));

    return results.map((r: any) => ({ ...r.menuItem, restaurant: r.restaurant }));
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

  async createItemAffinity(affinity: InsertItemAffinity): Promise<ItemAffinity> {
    const [res] = await db.insert(itemAffinity).values(affinity).returning();
    return res;
  }

  async clearAllRestaurants(): Promise<void> {
    await db.delete(itemAffinity);
    await db.delete(menuItems);
    await db.delete(recommendations);
    await db.delete(restaurants);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
}

export class MemStorage implements IStorage {
  private restaurants: Map<number, Restaurant>;
  private menuItems: Map<number, MenuItem>;
  private recommendations: Map<number, Recommendation>;
  private users: Map<number, User>;
  private restaurantId: number;
  private menuItemId: number;
  private recommendationId: number;
  private userId: number;
  private affinities: Map<number, ItemAffinity>;
  private affinityId: number;
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemorySessionStore({
      checkPeriod: 86400000,
    });
    this.restaurants = new Map();
    this.menuItems = new Map();
    this.recommendations = new Map();
    this.users = new Map();
    this.restaurantId = 1;
    this.menuItemId = 1;
    this.recommendationId = 1;
    this.userId = 1;
    this.affinities = new Map();
    this.affinityId = 1;
  }

  async getRestaurants(offset = 0, limit = 20): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values())
      .sort((a, b) => a.id - b.id)
      .slice(offset, offset + limit);
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async getMenuByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.restaurantId === restaurantId
    );
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values());
  }

  async getAllMenuItemsWithRestaurants(): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    return Array.from(this.menuItems.values()).map(item => ({
      ...item,
      restaurant: this.restaurants.get(item.restaurantId)!
    }));
  }

  async getMenuItemsByType(type: string): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.type === type)
      .map(item => ({
        ...item,
        restaurant: this.restaurants.get(item.restaurantId)!
      }));
  }

  async getMenuItemsByName(name: string): Promise<MenuItem[]> {
    const lowerName = name.toLowerCase();
    return Array.from(this.menuItems.values()).filter(item =>
      item.name.toLowerCase().includes(lowerName)
    );
  }

  async getRestaurantsByName(name: string): Promise<Restaurant[]> {
    const lowerName = name.toLowerCase();
    return Array.from(this.restaurants.values()).filter(res =>
      res.name.toLowerCase().includes(lowerName)
    );
  }

  async getItemAffinity(itemIds: number[]): Promise<(MenuItem & { restaurant: Restaurant })[]> {
    if (itemIds.length === 0) return [];

    const recIds = Array.from(this.affinities.values())
      .filter(a => itemIds.includes(a.baseItemId) && !itemIds.includes(a.recommendedItemId))
      .sort((a, b) => b.score - a.score)
      .map(a => a.recommendedItemId)
      .filter((id, index, self) => self.indexOf(id) === index) // Unique
      .slice(0, 8);

    return Array.from(this.menuItems.values())
      .filter(item => recIds.includes(item.id))
      .map(item => ({
        ...item,
        restaurant: this.restaurants.get(item.restaurantId)!
      }));
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantId++;
    const restaurant: Restaurant = {
      ...insertRestaurant,
      id,
      is_pure_veg_restaurant: insertRestaurant.is_pure_veg_restaurant ?? false
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemId++;
    const menuItem: MenuItem = {
      ...insertMenuItem,
      id,
      isPureVeg: insertMenuItem.isPureVeg ?? false,
      cuisineType: insertMenuItem.cuisineType ?? "Indian"
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  async createRecommendation(insertRec: InsertRecommendation): Promise<Recommendation> {
    const id = this.recommendationId++;
    const recommendation: Recommendation = { ...insertRec, id };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async createItemAffinity(insertAffinity: InsertItemAffinity): Promise<ItemAffinity> {
    const id = this.affinityId++;
    const affinity: ItemAffinity = {
      ...insertAffinity,
      id,
      score: insertAffinity.score ?? 100
    };
    this.affinities.set(id, affinity);
    return affinity;
  }

  async clearAllRestaurants(): Promise<void> {
    this.restaurants.clear();
    this.menuItems.clear();
    this.recommendations.clear();
    this.users.clear();
    this.affinities.clear();
    this.restaurantId = 1;
    this.menuItemId = 1;
    this.recommendationId = 1;
    this.userId = 1;
    this.affinityId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.uid === uid
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...insertUser,
      id,
      fullName: insertUser.fullName ?? "",
      address: insertUser.address ?? "",
      photoURL: insertUser.photoURL ?? "",
      role: (insertUser.role as "user" | "admin" | "superadmin") ?? "user",
      isProfileComplete: insertUser.isProfileComplete ?? false,
      mobile: insertUser.mobile ?? "",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteMenuItem(id: number): Promise<void> {
    this.menuItems.delete(id);
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
