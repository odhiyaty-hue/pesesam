import { db } from "./db";
import {
  users, tournaments, participants, matches, results,
  type User, type Tournament, type Participant, type Match, type Result
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: { id: string; email: string; realName?: string; ingameName?: string; avatarUrl?: string }): Promise<User>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  createTournament(tournament: Omit<Tournament, "id">): Promise<Tournament>;
  updateTournament(id: number, status: string): Promise<Tournament>;
  
  // Participants
  getParticipants(tournamentId: number): Promise<Participant[]>;
  createParticipant(participant: Omit<Participant, "id">): Promise<Participant>;
  
  // Matches
  getMatches(tournamentId: number): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatches(newMatches: Omit<Match, "id">[]): Promise<Match[]>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match>;
  
  // Results
  getResults(matchId: number): Promise<Result[]>;
  createResult(result: Omit<Result, "id">): Promise<Result>;
  deleteResult(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async upsertUser(data: { id: string; email: string; realName?: string; ingameName?: string; avatarUrl?: string }): Promise<User> {
    const [user] = await db.insert(users)
      .values({ 
        id: data.id, 
        email: data.email, 
        role: "player",
        realName: data.realName,
        ingameName: data.ingameName,
        avatarUrl: data.avatarUrl
      })
      .onConflictDoUpdate({ 
        target: users.id, 
        set: { 
          email: data.email,
          realName: data.realName,
          ingameName: data.ingameName,
          avatarUrl: data.avatarUrl
        } 
      })
      .returning();
    return user;
  }

  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async createTournament(tournament: Omit<Tournament, "id">): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  async updateTournament(id: number, status: string): Promise<Tournament> {
    const [tournament] = await db.update(tournaments)
      .set({ status })
      .where(eq(tournaments.id, id))
      .returning();
    return tournament;
  }

  async getParticipants(tournamentId: number): Promise<Participant[]> {
    return await db.select().from(participants).where(eq(participants.tournamentId, tournamentId));
  }

  async createParticipant(participant: Omit<Participant, "id">): Promise<Participant> {
    const [newParticipant] = await db.insert(participants).values(participant).returning();
    return newParticipant;
  }

  async getMatches(tournamentId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.tournamentId, tournamentId));
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async createMatches(newMatches: Omit<Match, "id">[]): Promise<Match[]> {
    if (newMatches.length === 0) return [];
    return await db.insert(matches).values(newMatches).returning();
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match> {
    const [match] = await db.update(matches)
      .set(updates)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getResults(matchId: number): Promise<Result[]> {
    return await db.select().from(results).where(eq(results.matchId, matchId));
  }

  async createResult(result: Omit<Result, "id">): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async deleteResult(id: number): Promise<void> {
    await db.delete(results).where(eq(results.id, id));
  }
}

export const storage = new DatabaseStorage();
