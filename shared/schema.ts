import { pgTable, text, serial, integer, numeric, boolean, varchar, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  rating: numeric("rating").notNull(),
  delivery_time: text("delivery_time").notNull(),
  cuisine: text("cuisine").notNull(),
  price_range: text("price_range").notNull(),
  location: text("location").notNull(),
  city: text("city").default("Mumbai").notNull(),
  distance: text("distance").notNull(),
  is_veg: text("is_veg").notNull(), // "veg", "non-veg", or "both"
  is_pure_veg_restaurant: boolean("is_pure_veg_restaurant").default(false).notNull(),
  is_bestseller: text("is_bestseller").notNull(), // "yes" or "no"
  is_open: boolean("is_open").default(true).notNull(),
  is_new: boolean("is_new").default(false).notNull(),
  ownerId: integer("owner_id"),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // stored in cents
  image: text("image").notNull(),
  category: text("category").notNull(),
  isVeg: boolean("is_veg").notNull(),
  isPureVeg: boolean("is_pure_veg").default(false).notNull(),
  type: text("type").notNull(), // "biryani", "pizza", "burger", etc.
  cuisineType: text("cuisine_type").default("Indian").notNull(),
  is_new: boolean("is_new").default(false).notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").default(""),
  fullName: text("full_name").default(""),
  photoURL: text("photo_url").default(""),
  role: text("role").$type<"user" | "admin" | "superadmin">().default("user"),
  address: text("address").default(""),
  isProfileComplete: boolean("is_profile_complete").default(false),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: text("created_at").notNull(), // To simply handle timestamps in this hackathon
});

export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const recommendationEvents = pgTable("recommendation_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  cartId: text("cart_id").notNull(),
  itemId: integer("item_id").notNull(),
  type: text("type").notNull(), // "impression" | "click"
  experimentGroup: text("experiment_group").notNull(), // "control" | "ml_variant"
  createdAt: text("created_at").notNull(),
});

export const itemAffinity = pgTable("item_affinity", {
  id: serial("id").primaryKey(),
  baseItemId: integer("base_item_id").notNull(),
  recommendedItemId: integer("recommended_item_id").notNull(),
  score: integer("score").default(100).notNull(), // higher means stronger relationship
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertRecommendationEventSchema = createInsertSchema(recommendationEvents).omit({ id: true });
export const insertItemAffinitySchema = createInsertSchema(itemAffinity).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type ItemAffinity = typeof itemAffinity.$inferSelect;
export type InsertItemAffinity = z.infer<typeof insertItemAffinitySchema>;
