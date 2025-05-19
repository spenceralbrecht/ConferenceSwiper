import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to access the sample events CSV file
  app.get("/api/events/csv", async (req, res) => {
    try {
      // Read from the updated MAU Vegas 2025 CSV file
      const filePath = path.join(process.cwd(), 'static', 'mau-final.csv');
      const csvData = await fs.readFile(filePath, 'utf8');
      
      res.header("Content-Type", "text/csv");
      res.send(csvData);
    } catch (error) {
      console.error("Error serving CSV:", error);
      res.status(500).send("Error loading events data");
    }
  });

  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Error getting events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error getting event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
