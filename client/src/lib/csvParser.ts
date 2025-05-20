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
      // Log raw times for debugging
      console.log(`Raw times for ${row["Event Name"]}: Start=${row.StartTime}, End=${row.EndTime}`);
      
      // Properly format the start and end times
      startTime = convertTimeFormat(row.StartTime);
      endTime = convertTimeFormat(row.EndTime);
      
      // Log converted times
      console.log(`Converted times: Start=${startTime}, End=${endTime}`);
    } 
    // Fall back to the Time field if StartTime/EndTime not available
    else if (row.Time) {
      console.log(`Using Time field for ${row["Event Name"]}: ${row.Time}`);
      
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
      
      console.log(`Extracted times: Start=${startTime}, End=${endTime}`);
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
  // If no input or empty string, return default
  if (!timeStr || timeStr.trim() === '') {
    console.warn(`Empty time string provided, using default "00:00"`);
    return "00:00";
  }

  // Normalize input string - remove extra spaces and make uppercase for consistent matching
  const normalizedTimeStr = timeStr.trim().toUpperCase();
  
  // Check if already in 24-hour format (e.g., "18:00")
  if (/^\d{1,2}:\d{2}$/.test(normalizedTimeStr)) {
    console.log(`Already in 24h format: ${normalizedTimeStr}`);
    const [hours, minutes] = normalizedTimeStr.split(':');
    // Ensure leading zeros
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  
  try {
    // Check for AM/PM format (like "6:00 PM", "6PM", etc.)
    const isAM = normalizedTimeStr.includes('AM');
    const isPM = normalizedTimeStr.includes('PM');
    
    if (!isAM && !isPM) {
      // No AM/PM indicator - assume it's 24-hour format but might be missing formatting
      if (normalizedTimeStr.includes(':')) {
        // Has colon - assume it's just missing leading zeros
        const [hours, minutes] = normalizedTimeStr.split(':');
        return `${parseInt(hours).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}`;
      }
      
      // Just a number (like "7" or "14") - assume hours only
      return `${parseInt(normalizedTimeStr).toString().padStart(2, '0')}:00`;
    }
    
    // Extract numeric part by removing AM/PM
    let timePart = normalizedTimeStr.replace(/\s*(AM|PM).*$/i, '').trim();
    
    // Check if we have a colon (time with minutes)
    if (timePart.includes(':')) {
      let [hours, minutes] = timePart.split(':');
      let hour = parseInt(hours);
      
      // Convert to 24-hour format
      if (isPM && hour < 12) {
        hour += 12;
      } else if (isAM && hour === 12) {
        hour = 0;
      }
      
      // Format with leading zeros
      return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } else {
      // No colon, just hours (like "7PM")
      let hour = parseInt(timePart);
      
      // Convert to 24-hour format
      if (isPM && hour < 12) {
        hour += 12;
      } else if (isAM && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  } catch (err) {
    console.error(`Error converting time format: ${timeStr}`, err);
    // Default to midnight if we can't parse
    return "00:00";
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
