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
  
  // Deduplicate events - the new CSV has both Main and Side entries for each event
  const uniqueEvents = new Map<string, any>();
  
  // Process each row and store by unique title+date+time key
  parseResult.data.forEach((row: any) => {
    // Skip empty rows
    if (!row["Event Name"]) return;
    
    // Create a unique key for this event
    const eventKey = `${row["Event Name"]}_${row.Date}_${row.StartTime || row.Time || ""}`;
    
    // If this event is already in our map
    if (uniqueEvents.has(eventKey)) {
      const existingEvent = uniqueEvents.get(eventKey);
      
      // Merge information from both entries (prefer Main over Side where applicable)
      if (row.Type === "Main" && existingEvent.type !== "Main") {
        // If this is the Main entry and the existing is Side, update description and other fields
        existingEvent.description = row.Description || existingEvent.description;
        existingEvent.type = row.Type;
      }
      
      // Add action links from Side entries
      if (row.Type === "Side" && row["Action Link"]) {
        existingEvent.actionLink = row["Action Link"];
        existingEvent.action = row.Action;
      }
    } else {
      // New unique event, add it to our map
      uniqueEvents.set(eventKey, row);
    }
  });
  
  // Convert the map values to an array for further processing
  const dedupedData = Array.from(uniqueEvents.values());
  
  // Map the deduped data to our Event schema
  const events: Event[] = dedupedData.map((row: any, index: number) => {
    // Parse start and end times
    let startTime = "00:00";
    let endTime = "00:00";
    
    // Try to get times from StartTime/EndTime fields first
    if (row.StartTime && row.EndTime) {
      startTime = convertTimeFormat(row.StartTime);
      endTime = convertTimeFormat(row.EndTime);
    } 
    // Fall back to the Time field if StartTime/EndTime not available
    else if (row.Time) {
      // Handle both standard hyphen and em-dash
      if (row.Time.includes("–")) {
        const timeParts = row.Time.split("–");
        startTime = convertTimeFormat(timeParts[0].trim());
        endTime = convertTimeFormat(timeParts[1].trim());
      } else if (row.Time.includes("-")) {
        const timeParts = row.Time.split("-");
        startTime = convertTimeFormat(timeParts[0].trim());
        endTime = convertTimeFormat(timeParts[1].trim());
      }
    }
    
    // Build the additional data for richer event information
    const additionalData: Record<string, string> = {};
    if (row.Action) additionalData.action = row.Action;
    if (row["Action Link"]) additionalData.actionLink = row["Action Link"];
    if (row["Details Link"]) additionalData.detailsLink = row["Details Link"];
    if (row.Sponsors) additionalData.sponsors = row.Sponsors;
    
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
      additionalData: Object.keys(additionalData).length > 0 ? JSON.stringify(additionalData) : null
    };
  });
  
  console.log(`Parsed ${events.length} events from CSV`);
  return events;
}

// Convert time format from "6:00 PM" to "18:00" format
function convertTimeFormat(timeStr: string): string {
  // If already in 24-hour format (e.g., "18:00"), return as is
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  // Handle AM/PM format
  try {
    // Strip any leading/trailing spaces
    timeStr = timeStr.trim();
    
    // If it's just a time without AM/PM, return as is
    if (!timeStr.includes("AM") && !timeStr.includes("PM")) {
      return timeStr;
    }
    
    // Parse the time components
    const isPM = timeStr.includes("PM");
    const timePart = timeStr.replace(/\s*[AP]M.*$/i, "").trim();
    
    let [hours, minutes] = timePart.split(":");
    let hour = parseInt(hours);
    
    // Convert to 24-hour format
    if (isPM && hour < 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }
    
    // Format with leading zeros
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinutes = minutes ? minutes.padStart(2, "0") : "00";
    
    return `${formattedHour}:${formattedMinutes}`;
  } catch (err) {
    console.error(`Error converting time format: ${timeStr}`, err);
    return timeStr; // Return original if parsing fails
  }
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
