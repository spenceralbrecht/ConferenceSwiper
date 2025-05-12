import { users, type User, type InsertUser, events, type Event, type InsertEvent } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  currentUserId: number;
  currentEventId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.currentUserId = 1;
    this.currentEventId = 1;
    
    // Add some sample events (these will be overridden by the CSV data in a real app)
    this.initSampleEvents();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
  
  private initSampleEvents() {
    const sampleEvents: InsertEvent[] = [
      {
        title: "Keynote: Future of Tech",
        description: "Join industry leaders as they discuss emerging technology trends and their impact on business and society. This keynote will cover AI, blockchain, and more.",
        date: "2023-06-12",
        startTime: "09:00",
        endTime: "10:30",
        location: "Main Hall, Floor 3",
        type: "main",
        speakers: ["Jane Doe", "John Smith"],
      },
      {
        title: "Hands-on ML Workshop",
        description: "Get practical experience with machine learning models in this interactive workshop. Bring your laptop to participate in coding exercises.",
        date: "2023-06-12",
        startTime: "11:00",
        endTime: "12:30",
        location: "Workshop Room B, Floor 2",
        type: "workshop",
        speakers: ["Sam Johnson"],
      },
      {
        title: "Diversity in Tech Panel",
        description: "Industry leaders discuss challenges and opportunities for increasing diversity in tech organizations.",
        date: "2023-06-12",
        startTime: "13:00",
        endTime: "14:30",
        location: "Auditorium, Floor 1",
        type: "panel",
        speakers: ["Maria Garcia", "David Wong", "Fatima Ali"],
      },
    ];
    
    sampleEvents.forEach(event => {
      this.createEvent(event);
    });
  }
}

export const storage = new MemStorage();
