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
    dynamicTyping: true
  });
  
  if (parseResult.errors.length > 0) {
    console.error("CSV parsing errors:", parseResult.errors);
  }
  
  // Map CSV data to Event objects
  const events: Event[] = parseResult.data.map((row: any, index: number) => {
    // Split speakers string into array if it exists
    const speakers = row.speakers ? row.speakers.split(',').map((s: string) => s.trim()) : [];
    
    // Transform row data to Event object
    return {
      id: row.id || index + 1,
      title: row.title || `Untitled Event ${index + 1}`,
      description: row.description || "No description provided",
      date: row.date || new Date().toISOString().split('T')[0],
      startTime: row.startTime || "00:00",
      endTime: row.endTime || "01:00",
      location: row.location || "TBD",
      type: row.type || "other",
      imageUrl: row.imageUrl || "",
      speakers: speakers,
    };
  });
  
  console.log(`Parsed ${events.length} events from CSV`);
  return events;
}
