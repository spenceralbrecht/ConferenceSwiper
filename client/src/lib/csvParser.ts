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
  console.log("CSV Text starts with:", csvText.substring(0, 100));
  
  // Parse CSV string to objects
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false // Keep everything as strings
  });
  
  console.log("CSV Parse Result:", {
    rowCount: parseResult.data.length,
    headers: parseResult.meta.fields,
    firstTwoRows: parseResult.data.slice(0, 2)
  });
  
  if (parseResult.errors.length > 0) {
    console.error("CSV parsing errors:", parseResult.errors);
  }
  
  // Deduplicate events - the new CSV has both Main and Side entries for each event
  const uniqueEvents = new Map<string, any>();
  
  // Process each row and store by unique title+date+time key
  parseResult.data.forEach((row: any, index: number) => {
    // Skip empty rows or rows with missing critical data
    if (!row["Event Name"] || !row.Date) {
      console.log("Skipping incomplete row:", row);
      return;
    }
    
    // Create a unique key for this event - use Date and Event Name since StartTime can be in different formats
    const eventKey = `${row["Event Name"]}_${row.Date}`;
    
    console.log(`Row ${index}:`, {
      name: row["Event Name"], 
      date: row.Date,
      type: row.Type,
      key: eventKey
    });
    
    // If this event is already in our map
    if (uniqueEvents.has(eventKey)) {
      const existingEvent = uniqueEvents.get(eventKey);
      
      // If we have both a Main and Side entry, merge them intelligently
      if (row.Type === "Main" && existingEvent.Type === "Side") {
        // Update basic info from Main entry
        existingEvent.Description = row.Description || existingEvent.Description;
        existingEvent.Location = row.Location || existingEvent.Location;
        existingEvent.Type = "Main"; // Keep the Main type
        
        // Keep the action links from Side entry if they exist
        if (!existingEvent.Action) existingEvent.Action = row.Action;
        if (!existingEvent["Action Link"]) existingEvent["Action Link"] = row["Action Link"];
      }
      else if (row.Type === "Side" && existingEvent.Type === "Main") {
        // Add action links from Side entry while preserving Main data
        existingEvent.Action = row.Action || existingEvent.Action;
        existingEvent["Action Link"] = row["Action Link"] || existingEvent["Action Link"];
        // Don't override main description or location
      }
      else {
        // If both are the same type, prefer the one with more data
        if (!existingEvent.Description && row.Description) {
          existingEvent.Description = row.Description;
        }
        if (row.Action && !existingEvent.Action) {
          existingEvent.Action = row.Action;
          existingEvent["Action Link"] = row["Action Link"];
        }
      }
    } else {
      // New unique event, add it to our map
      // For Side events with no description, give them a placeholder
      if (row.Type === "Side" && !row.Description) {
        row.Description = row["Event Name"] || "Event details available at venue";
      }
      
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
    
    // Fix location field for Side events that have location in wrong column
    let location = row.Location || "TBD";
    
    // Fix case where location is actually a time (common error in Side events)
    if (location.includes(":") || location.includes("AM") || location.includes("PM")) {
      console.log("Fixing incorrect location field:", location);
      location = "TBD";
    }
    
    // Debug output
    console.log("Processing event:", {
      name: row["Event Name"],
      times: `${startTime} - ${endTime}`,
      location: location,
      type: row.Type
    });
    
    // Map the MAU Vegas CSV columns to our Event schema
    return {
      id: index + 1,
      title: row["Event Name"] || `Untitled Event ${index + 1}`,
      description: row.Description || "No description provided",
      date: row.Date || new Date().toISOString().split('T')[0],
      startTime: startTime,
      endTime: endTime,
      location: location,
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
