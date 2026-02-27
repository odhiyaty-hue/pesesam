import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";

const upload = multer();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Users
  app.get(api.users.me.path, async (req, res) => {
    res.status(401).json({ message: "Use Supabase client on frontend" });
  });

  app.post(api.users.sync.path, async (req, res) => {
    try {
      const input = api.users.sync.input.parse(req.body);
      const user = await storage.upsertUser({ id: input.id, email: input.email });
      res.json(user);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Tournaments
  app.get(api.tournaments.list.path, async (req, res) => {
    const data = await storage.getTournaments();
    res.json(data);
  });

  app.get(api.tournaments.get.path, async (req, res) => {
    const data = await storage.getTournament(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });

  app.post(api.tournaments.create.path, async (req, res) => {
    try {
      const input = api.tournaments.create.input.parse(req.body);
      const t = await storage.createTournament({
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : null,
        status: input.status ?? "open"
      });
      res.status(201).json(t);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: e.errors[0].message, field: e.errors[0].path.join('.') });
      } else {
        res.status(500).json({ message: "Internal Error" });
      }
    }
  });

  app.post(api.tournaments.join.path, async (req, res) => {
    const tId = Number(req.params.id);
    const userId = req.headers.authorization?.replace('Bearer ', ''); // Supabase token or ID
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Assuming we sync'd the user, we should use the actual user ID.
    // For simplicity, we just use the token/ID from frontend directly if passed as header
    // In a production app, verify the Supabase JWT.

    const t = await storage.getTournament(tId);
    if (!t) return res.status(404).json({ message: "Not found" });
    if (t.status !== "open") return res.status(400).json({ message: "Tournament is not open" });

    const parts = await storage.getParticipants(tId);
    if (parts.length >= t.maxPlayers) return res.status(400).json({ message: "Tournament is full" });

    const p = await storage.createParticipant({ tournamentId: tId, userId });
    res.json(p);
  });

  app.post(api.tournaments.generateBracket.path, async (req, res) => {
    const tId = Number(req.params.id);
    const parts = await storage.getParticipants(tId);
    
    const shuffled = [...parts].sort(() => 0.5 - Math.random());
    const matchesToCreate = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matchesToCreate.push({
          tournamentId: tId,
          player1Id: shuffled[i].userId,
          player2Id: shuffled[i + 1].userId,
          winnerId: null,
          status: "pending",
          round: 1
        });
      }
    }
    const createdMatches = await storage.createMatches(matchesToCreate);
    await storage.updateTournament(tId, "in_progress");
    res.json(createdMatches);
  });

  // Matches
  app.get(api.matches.listByTournament.path, async (req, res) => {
    const data = await storage.getMatches(Number(req.params.id));
    res.json(data);
  });

  app.get(api.matches.get.path, async (req, res) => {
    const data = await storage.getMatch(Number(req.params.id));
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  });

  app.post(api.matches.confirmWinner.path, async (req, res) => {
    try {
      const input = api.matches.confirmWinner.input.parse(req.body);
      const match = await storage.updateMatch(Number(req.params.id), { 
        winnerId: input.winnerId, 
        status: "validated" 
      });
      res.json(match);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Results
  app.get(api.results.listByMatch.path, async (req, res) => {
    const data = await storage.getResults(Number(req.params.id));
    res.json(data);
  });

  app.post(api.results.upload.path, async (req, res) => {
    try {
      const input = api.results.upload.input.parse(req.body);
      const uploadedBy = req.headers.authorization?.replace('Bearer ', '') || "mock-user-id";
      const result = await storage.createResult({ 
        matchId: Number(req.params.id), 
        screenshotUrl: input.screenshotUrl, 
        uploadedBy 
      });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.results.delete.path, async (req, res) => {
    await storage.deleteResult(Number(req.params.id));
    res.status(204).send();
  });

  // Upload proxy to ImgBB
  app.post(api.upload.path, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    try {
      const base64Image = req.file.buffer.toString('base64');
      
      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        console.warn("IMGBB_API_KEY not set. Generating mock URL.");
        // Mock upload for development if API key isn't set yet
        return res.json({ url: "https://via.placeholder.com/800x600.png?text=Mock+Screenshot" });
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ image: base64Image })
      });
      
      const result = await response.json();
      if (result.success) {
        res.json({ url: result.data.url });
      } else {
        res.status(500).json({ message: "Failed to upload to ImgBB" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Upload failed" });
    }
  });

  return httpServer;
}
