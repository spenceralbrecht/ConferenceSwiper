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
      // In a real application, this would be stored in a database
      // For this example, we'll create a sample CSV file
      const csvData = `id,title,description,date,startTime,endTime,location,type,imageUrl,speakers
1,Keynote: Future of Tech,Join industry leaders as they discuss emerging technology trends and their impact on business and society. This keynote will cover AI blockchain and more.,2023-06-12,09:00,10:30,Main Hall Floor 3,main,,Jane Doe,John Smith
2,Hands-on ML Workshop,Get practical experience with machine learning models in this interactive workshop. Bring your laptop to participate in coding exercises.,2023-06-12,11:00,12:30,Workshop Room B Floor 2,workshop,,Sam Johnson
3,Diversity in Tech Panel,Industry leaders discuss challenges and opportunities for increasing diversity in tech organizations.,2023-06-12,13:00,14:30,Auditorium Floor 1,panel,,Maria Garcia,David Wong,Fatima Ali
4,Networking Lunch,Connect with fellow attendees over a catered lunch. Great opportunity to exchange ideas and build your professional network.,2023-06-12,12:00,13:30,Dining Hall,networking,,
5,Mobile App Development,Learn the latest techniques for building cross-platform mobile applications with React Native.,2023-06-12,14:30,16:00,Workshop Room A Floor 2,workshop,,Alex Chen
6,Cybersecurity Best Practices,Protecting your organization in an increasingly complex threat landscape. Practical advice for companies of all sizes.,2023-06-12,16:30,18:00,Conference Room 3 Floor 1,main,,Jessica Williams,Michael Brown
7,Startup Pitch Competition,Watch innovative startups pitch their ideas to a panel of venture capitalists and industry experts.,2023-06-13,10:00,12:00,Auditorium Floor 1,main,,Various Presenters
8,Cloud Architecture Patterns,Design patterns for scalable and resilient cloud applications. Case studies and practical examples.,2023-06-13,13:00,14:30,Conference Room 2 Floor 1,workshop,,Robert Jackson
9,UX Research Methods,Effective techniques for understanding user needs and testing product usability.,2023-06-13,15:00,16:30,Workshop Room B Floor 2,workshop,,Emily Davis
10,Evening Reception,Join us for drinks and appetizers while networking with speakers and fellow attendees.,2023-06-13,18:30,20:30,Rooftop Terrace,networking,,
11,Blockchain in Enterprise,Real-world applications of blockchain technology beyond cryptocurrencies.,2023-06-14,09:30,11:00,Conference Room 1 Floor 1,panel,,Sarah Miller,James Wilson,Raj Patel
12,Developer Productivity Tools,Boost your productivity with the latest tools and techniques for modern software development.,2023-06-14,11:30,13:00,Workshop Room A Floor 2,workshop,,Carlos Mendez
13,AI Ethics Roundtable,Open discussion on ethical considerations in artificial intelligence development and deployment.,2023-06-14,14:00,15:30,Conference Room 4 Floor 1,panel,,Various Participants
14,Closing Keynote,Reflections on the conference and insights on future technology directions.,2023-06-14,16:00,17:30,Main Hall Floor 3,main,,Conference Chair`;
      
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
