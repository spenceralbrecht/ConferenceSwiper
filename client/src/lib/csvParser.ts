import { Event } from "@shared/schema";
import Papa from "papaparse";

// Load event data from CSV file
export async function loadEvents(): Promise<Event[]> {
  try {
    const response = await fetch("/api/events/csv");
    if (!response.ok) {
      throw new Error("Failed to fetch CSV data");
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Error loading CSV:", error);
    throw error;
  }
}

// Parse CSV data into Event objects
function parseCSV(csvText: string): Event[] {
  // Parse CSV string to objects
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false // Keep everything as strings
  });
  
  if (parseResult.errors.length > 0) {
    console.error("CSV parsing errors:", parseResult.errors);
  }
  
  // Map CSV data to Event objects
  const events: Event[] = parseResult.data.map((row: any, index: number) => {
    // Parse time field which is in format "HH:MM–HH:MM" (using special dash character)
    let startTime = "00:00";
    let endTime = "00:00";
    
    if (row.Time) {
      // Handle both standard hyphen and em-dash
      if (row.Time.includes("–")) {
        const timeParts = row.Time.split("–");
        startTime = timeParts[0].trim();
        endTime = timeParts[1].trim();
      } else if (row.Time.includes("-")) {
        const timeParts = row.Time.split("-");
        startTime = timeParts[0].trim();
        endTime = timeParts[1].trim();
      }
    }
    
    // Map the MAU Vegas CSV columns to our Event schema
    return {
      id: index + 1,
      title: row["Event Name"] || `Untitled Event ${index + 1}`,
      description: row.Description || "No description provided",
      date: row.Date || new Date().toISOString().split('T')[0],
      startTime: startTime,
      endTime: endTime,
      location: row.Location || "TBD",
      // Map "Main" and "Side" to our event type enum
      type: mapEventType(row.Type),
      imageUrl: "", // No images in the CSV
      speakers: [], // No speakers specifically listed
    };
  });
  
  console.log(`Parsed ${events.length} events from CSV`);
  return events;
}

// Map MAU event types to our schema's event types
function mapEventType(type: string): "main" | "workshop" | "panel" | "networking" | "breakout" | "other" {
  if (!type) return "other";
  
  switch (type.toLowerCase()) {
    case "main":
      return "main";
    case "side":
      // For MAU Vegas, we'll map "Side" events to "networking" for visual distinction
      // This will make them appear with a purple background in our UI
      return "networking";
    default:
      return "other";
  }
}
