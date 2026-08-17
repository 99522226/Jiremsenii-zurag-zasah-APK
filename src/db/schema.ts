import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  language: varchar("language", { length: 10 }).notNull().default("mn"),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  featured: boolean("featured").default(false),
  prompt: text("prompt"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  rating: integer("rating").default(50),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id"),
  userName: varchar("user_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  items: jsonb("items").$type<Array<{
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}>>().notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("bank_transfer"),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"),
  uploadedPhoto: text("uploaded_photo"),
prompt: text("prompt"),
generatedPhoto: text("generated_photo"),
editedPhoto: text("edited_photo"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  dailyOrderNumber: integer("daily_order_number").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  label: varchar("label", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }),
  userEmail: varchar("user_email", { length: 255 }),
  userPhone: varchar("user_phone", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  sender: varchar("sender", { length: 20 }).notNull(),
  message: text("message").notNull(),
  isBot: boolean("is_bot").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
