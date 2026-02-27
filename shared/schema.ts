import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Supabase auth user UUID
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("player"), // "admin" or "player"
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  maxPlayers: integer("max_players").notNull(),
  status: text("status").notNull().default("open"), // "open", "full", "in_progress", "completed"
  startDate: timestamp("start_date"),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  player1Id: varchar("player1_id").references(() => users.id), // nullable for TBD
  player2Id: varchar("player2_id").references(() => users.id), // nullable for TBD
  winnerId: varchar("winner_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // "pending", "played", "validated"
  round: integer("round").notNull(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  screenshotUrl: text("screenshot_url").notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export const insertParticipantSchema = createInsertSchema(participants).omit({ id: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Tournament = typeof tournaments.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Result = typeof results.$inferSelect;
