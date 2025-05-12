import { useState, useEffect } from "react";
import { Event } from "@shared/schema";
import { getStorage, setStorage } from "@/lib/storage";

interface UseScheduleReturn {
  interestedEvents: number[];
  notInterestedEvents: number[];
  addInterested: (event: Event) => void;
  addNotInterested: (event: Event) => void;
  removeInterested: (eventId: number) => void;
  isEventRated: (eventId: number) => boolean;
}

export function useSchedule(): UseScheduleReturn {
  const [interestedEvents, setInterestedEvents] = useState<number[]>([]);
  const [notInterestedEvents, setNotInterestedEvents] = useState<number[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    console.log("Loading saved preferences from localStorage");
    
    const savedInterested = getStorage("interestedEvents") || [];
    const savedNotInterested = getStorage("notInterestedEvents") || [];
    
    setInterestedEvents(savedInterested);
    setNotInterestedEvents(savedNotInterested);
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (interestedEvents.length > 0) {
      console.log("Saving interested events to localStorage:", interestedEvents);
      setStorage("interestedEvents", interestedEvents);
    }
  }, [interestedEvents]);

  useEffect(() => {
    if (notInterestedEvents.length > 0) {
      console.log("Saving not interested events to localStorage:", notInterestedEvents);
      setStorage("notInterestedEvents", notInterestedEvents);
    }
  }, [notInterestedEvents]);

  const addInterested = (event: Event) => {
    console.log("Adding event to interested:", event.id);
    
    // If the event was previously not interested, remove it
    const filteredNotInterested = notInterestedEvents.filter(id => id !== event.id);
    
    // Only add if not already in the list
    if (!interestedEvents.includes(event.id)) {
      setInterestedEvents(prev => [...prev, event.id]);
    }
    
    // Update not interested if needed
    if (filteredNotInterested.length !== notInterestedEvents.length) {
      setNotInterestedEvents(filteredNotInterested);
    }
  };

  const addNotInterested = (event: Event) => {
    console.log("Adding event to not interested:", event.id);
    
    // If the event was previously interested, remove it
    const filteredInterested = interestedEvents.filter(id => id !== event.id);
    
    // Only add if not already in the list
    if (!notInterestedEvents.includes(event.id)) {
      setNotInterestedEvents(prev => [...prev, event.id]);
    }
    
    // Update interested if needed
    if (filteredInterested.length !== interestedEvents.length) {
      setInterestedEvents(filteredInterested);
    }
  };

  const removeInterested = (eventId: number) => {
    console.log("Removing event from interested:", eventId);
    setInterestedEvents(prev => prev.filter(id => id !== eventId));
  };

  const isEventRated = (eventId: number): boolean => {
    return interestedEvents.includes(eventId) || notInterestedEvents.includes(eventId);
  };

  return {
    interestedEvents,
    notInterestedEvents,
    addInterested,
    addNotInterested,
    removeInterested,
    isEventRated
  };
}
