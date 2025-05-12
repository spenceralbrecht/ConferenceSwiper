import { useState, useEffect } from "react";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useEventData() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log("Fetching event data from API");
      try {
        const response = await apiRequest("GET", "/api/events", undefined);
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err : new Error("Unknown error fetching events"));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}
