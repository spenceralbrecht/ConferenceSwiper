import { useState, useEffect } from "react";
import { Event } from "@shared/schema";
import { useSchedule } from "@/hooks/use-schedule";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import EventDetailModal from "@/components/EventDetailModal";
import TimeConflictBadge from "@/components/TimeConflictBadge";
import { checkTimeConflict } from "@/lib/utils";
import { X, Clock, MapPin, Calendar } from "lucide-react";

interface ScheduleScreenProps {
  events: Event[];
}

export default function ScheduleScreen({ events }: ScheduleScreenProps) {
  console.log("ScheduleScreen component mounted");
  
  const { interestedEvents, removeInterested } = useSchedule();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Get all interested events objects
  const scheduledEvents = events.filter((event) => 
    interestedEvents.includes(event.id)
  );
  
  // Extract unique dates from the scheduled events
  const uniqueDatesSet = new Set(scheduledEvents.map(event => event.date));
  const uniqueDates = Array.from(uniqueDatesSet).sort();
  
  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);
  
  // Filter events by selected date
  const eventsForSelectedDate = scheduledEvents.filter(
    (event) => event.date === selectedDate
  );
  
  // Sort events by start time
  const sortedEvents = [...eventsForSelectedDate].sort((a, b) => {
    // Convert time strings to minutes since midnight for comparison
    const aMinutes = timeStringToMinutes(a.startTime);
    const bMinutes = timeStringToMinutes(b.startTime);
    return aMinutes - bMinutes;
  });
  
  // Check for time conflicts
  const eventsWithConflicts = sortedEvents.map(event => {
    const conflicts = eventsForSelectedDate.filter(
      otherEvent => 
        event.id !== otherEvent.id && 
        checkTimeConflict(
          event.startTime, 
          event.endTime, 
          otherEvent.startTime, 
          otherEvent.endTime
        )
    );
    return {
      ...event,
      hasConflict: conflicts.length > 0,
      conflictingEvents: conflicts
    };
  });
  
  const handleRemoveEvent = (eventId: number) => {
    console.log("Removing event from schedule:", eventId);
    removeInterested(eventId);
  };
  
  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  
  // Format date for display in header
  const formatDateHeader = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Schedule</h2>
        <p className="text-sm text-gray-500">
          You have selected <span className="font-medium">{scheduledEvents.length}</span> events
        </p>
      </div>
      
      {scheduledEvents.length > 0 ? (
        <>
          {/* Date Navigation */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            {uniqueDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                className={selectedDate === date ? "bg-primary" : ""}
                onClick={() => setSelectedDate(date)}
              >
                {format(parseISO(date), "MMM d")}
              </Button>
            ))}
          </div>
          
          {/* Selected Date Header */}
          {selectedDate && (
            <div className="flex items-center mb-3 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDateHeader(selectedDate)}
            </div>
          )}
          
          {/* Schedule List */}
          <div className="space-y-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
            {eventsWithConflicts.length > 0 ? (
              eventsWithConflicts.map((event) => {
                // Determine if this is a MAU Vegas event
                const isMauEvent = event.date.startsWith('2025-05');
                
                // Get the appropriate event type label
                const eventTypeLabel = isMauEvent 
                  ? (event.type === 'main' ? 'Official Event' : 'Side Event')
                  : capitalizeFirstLetter(event.type);
                
                return (
                  <div 
                    key={event.id} 
                    className={`bg-white rounded-lg shadow p-3 border-l-4 ${event.hasConflict ? "border-red-500" : "border-primary"} ${event.hasConflict ? "animate-pulse" : ""}`}
                    onClick={() => openEventDetails(event)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block ${getTypeBadgeColor(event.type)} text-xs px-2 py-0.5 rounded-full`}>
                            {eventTypeLabel}
                          </span>
                          {event.hasConflict && <TimeConflictBadge />}
                        </div>
                        <h3 className="text-base font-medium mt-1">{event.title}</h3>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveEvent(event.id);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                      <span className="mx-2">•</span>
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No events scheduled for this date.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">No Events Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Start swiping to build your schedule</p>
        </div>
      )}
      
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          isVisible={showModal} 
          onClose={() => setShowModal(false)} 
          isScheduled={true}
          onRemove={() => {
            removeInterested(selectedEvent.id);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

// Convert time string (HH:MM) to minutes since midnight for sorting
function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case "main":
      return "bg-blue-100 text-blue-800";
    case "workshop":
      return "bg-green-100 text-green-800";
    case "panel":
      return "bg-yellow-100 text-yellow-800";
    case "networking":
      return "bg-purple-100 text-purple-800";
    case "breakout":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
