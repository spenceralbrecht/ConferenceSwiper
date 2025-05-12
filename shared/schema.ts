import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains unchanged for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Create event type enum
export const eventTypeEnum = pgEnum("event_type", [
  "main",
  "workshop",
  "panel",
  "networking",
  "breakout",
  "other"
]);

// Conference events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  startTime: text("start_time").notNull(), // Format: HH:MM
  endTime: text("end_time").notNull(), // Format: HH:MM
  location: text("location").notNull(),
  type: eventTypeEnum("type").notNull().default("other"),
  imageUrl: text("image_url"),
  speakers: text("speakers").array(), // Array of speaker names
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// User selections schema
export const userSelections = pgTable("user_selections", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  interested: boolean("interested").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSelectionSchema = createInsertSchema(userSelections).omit({
  id: true,
  createdAt: true,
});

export type InsertUserSelection = z.infer<typeof insertUserSelectionSchema>;
export type UserSelection = typeof userSelections.$inferSelect;
