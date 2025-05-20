import { useState, useEffect } from "react";
import { Event } from "@shared/schema";
import { useSchedule } from "@/hooks/use-schedule";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import TimeConflictBadge from "@/components/TimeConflictBadge";
import { checkTimeConflict } from "@/lib/utils";
import { X, Clock, MapPin, Calendar } from "lucide-react";

interface ScheduleScreenProps {
  events: Event[];
}

export default function ScheduleScreen({ events }: ScheduleScreenProps) {
  console.log("ScheduleScreen component mounted");
  
  const { interestedEvents, removeInterested } = useSchedule();
  
  // Get all interested events objects
  const scheduledEvents = events.filter((event) => 
    interestedEvents.includes(event.id)
  );
  
  // Group events by date
  const eventsByDate = scheduledEvents.reduce<Record<string, Event[]>>((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});
  
  // Sort dates chronologically
  const sortedDates = Object.keys(eventsByDate).sort();
  
  // For each date, sort events by start time and check for conflicts
  const processedEventsByDate = sortedDates.map(date => {
    // Sort events by start time
    const sortedEvents = [...eventsByDate[date]].sort((a, b) => {
      const aMinutes = timeStringToMinutes(a.startTime);
      const bMinutes = timeStringToMinutes(b.startTime);
      return aMinutes - bMinutes;
    });
    
    // Check for time conflicts
    const eventsWithConflicts = sortedEvents.map(event => {
      const conflicts = eventsByDate[date].filter(
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
    
    return {
      date,
      formattedDate: formatDateHeader(date),
      events: eventsWithConflicts
    };
  });
  
  const handleRemoveEvent = (eventId: number) => {
    console.log("Removing event from schedule:", eventId);
    removeInterested(eventId);
  };
  
  // Direct date formatting function - use hardcoded mapping to ensure correct display
  function formatDateHeader(dateStr: string) {
    // Directly map date strings to their desired display format
    const dateMap: Record<string, string> = {
      "2025-05-19": "Monday, May 19, 2025",
      "2025-05-20": "Tuesday, May 20, 2025",
      "2025-05-21": "Wednesday, May 21, 2025",
      "2025-05-22": "Thursday, May 22, 2025",
      "2025-05-23": "Friday, May 23, 2025"
    };
    
    // Use the direct mapping if it exists
    if (dateMap[dateStr]) {
      console.log(`Using direct date mapping for ${dateStr}: ${dateMap[dateStr]}`);
      return dateMap[dateStr];
    }
    
    // Fallback to parsing date (should not normally happen)
    console.warn(`No direct mapping found for date ${dateStr}, using fallback method`);
    
    // Parse YYYY-MM-DD manually to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Month names for manual formatting
    const monthNames = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];
                         
    // Day names for manual formatting
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Create a local date with the exact values (this is only for getting the day of week)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = dayNames[date.getDay()];
    
    // Format manually to ensure exact day
    return `${dayOfWeek}, ${monthNames[month - 1]} ${day}, ${year}`;
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Schedule</h2>
        <p className="text-sm text-gray-500">
          You have {scheduledEvents.length} events scheduled
        </p>
      </div>
      
      {scheduledEvents.length > 0 ? (
        <div className="space-y-8">
          {processedEventsByDate.map(({ date, formattedDate, events }) => (
            <div key={date} className="mb-6">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-white py-2 mb-3 border-b border-gray-200">
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  <Calendar className="h-5 w-5 mr-2 text-rose-500" />
                  {formattedDate}
                </h3>
              </div>
              
              {/* Timeline */}
              <div className="relative pl-8 border-l-2 border-gray-100">
                {events.map((event, index) => {
                  // Determine styles based on event type
                  const isMauEvent = event.date.startsWith('2025-05');
                  const eventTypeLabel = isMauEvent 
                    ? (event.type === 'main' ? 'Official Event' : 'Side Event')
                    : capitalizeFirstLetter(event.type);
                  
                  // Colors for event type - using Airbnb-inspired colors
                  const typeColors = {
                    main: "bg-rose-100 text-rose-800 border-rose-500",
                    workshop: "bg-teal-100 text-teal-800 border-teal-500",
                    panel: "bg-amber-100 text-amber-800 border-amber-500",
                    networking: "bg-cyan-100 text-cyan-800 border-cyan-500",
                    breakout: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-500",
                    other: "bg-slate-100 text-slate-800 border-slate-500"
                  };
                  
                  const colorClass = typeColors[event.type as keyof typeof typeColors] || typeColors.other;
                  
                  return (
                    <div key={event.id} className="mb-6 relative">
                      {/* Timeline dot */}
                      <div 
                        className={`absolute -left-10 w-4 h-4 rounded-full mt-1.5 ${event.type === 'main' ? 'bg-rose-500' : 'bg-teal-500'}`}
                      ></div>
                      
                      {/* Timeline card */}
                      <div 
                        className={`bg-white rounded-lg shadow-md border-l-4 ${event.hasConflict ? "border-red-500" : colorClass.split(' ')[2]}`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${colorClass.split(' ').slice(0, 2).join(' ')}`}>
                                  {eventTypeLabel}
                                </span>
                                {event.hasConflict && <TimeConflictBadge />}
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h4>
                              
                              <div className="space-y-1 mb-2">
                                <div className="flex items-center text-sm text-gray-700">
                                  <Clock className="h-4 w-4 mr-2 text-rose-500" />
                                  <span className="font-medium">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                                </div>
                                <div className="flex items-start text-sm text-gray-700">
                                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-rose-500" />
                                  <span className="font-medium">{event.location}</span>
                                </div>
                              </div>
                              
                              {/* Description */}
                              <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                              
                              {/* Action Buttons */}
                              <div className="mt-4 flex flex-col justify-center items-center border-t border-gray-100 pt-3">
                                {/* RSVP Button */}
                                <div className="w-full flex justify-center mb-2">
                                  {event.additionalData && (() => {
                                    try {
                                      // Parse the additionalData
                                      const data = JSON.parse(typeof event.additionalData === 'string' ? event.additionalData : '{}');
                                      
                                      // First priority: Action + ActionLink
                                      if (data.action && data.actionLink) {
                                        const url = data.actionLink.startsWith('http') 
                                          ? data.actionLink 
                                          : `https://mauvegas.com/${data.actionLink}`;
                                        
                                        return (
                                          <div 
                                            className="inline-flex items-center text-sm font-medium bg-rose-600 text-white py-2 px-5 rounded-md hover:bg-rose-700 shadow-md cursor-pointer"
                                            style={{ userSelect: 'none' }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Use plain JavaScript to handle opening URL directly
                                              console.log(`SCHEDULE VIEW: DIRECT LINK ATTEMPT for event ${event.id}: ${url}`);
                                              // Try multiple browser approaches
                                              try {
                                                // Method 1: window.location direct
                                                const win = window.open(url, '_blank');
                                                if (win) {
                                                  win.focus();
                                                  console.log('Window opened success method 1');
                                                } else {
                                                  // Method 2: Create and click a link
                                                  const link = document.createElement('a');
                                                  link.href = url;
                                                  link.setAttribute('target', '_blank');
                                                  link.setAttribute('rel', 'noopener noreferrer');
                                                  document.body.appendChild(link);
                                                  link.click();
                                                  document.body.removeChild(link);
                                                  console.log('Window opened success method 2');
                                                }
                                              } catch (err) {
                                                console.error('Failed to open link:', err);
                                                // Last resort: change window location
                                                alert(`Can't open in new tab. Redirecting to: ${url}`);
                                                window.location.href = url;
                                              }
                                            }}
                                          >
                                            {data.action}
                                          </div>
                                        );
                                      } 
                                      
                                      // Second priority: DetailsLink
                                      if (data.detailsLink) {
                                        const url = data.detailsLink.startsWith('http') 
                                          ? data.detailsLink 
                                          : `https://mauvegas.com/${data.detailsLink}`;
                                        
                                        return (
                                          <div 
                                            className="inline-flex items-center text-sm font-medium bg-rose-600 text-white py-2 px-5 rounded-md hover:bg-rose-700 shadow-md cursor-pointer"
                                            style={{ userSelect: 'none' }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Use plain JavaScript to handle opening URL directly
                                              console.log(`SCHEDULE VIEW: DIRECT LINK ATTEMPT for event ${event.id}: ${url}`);
                                              // Try multiple browser approaches
                                              try {
                                                // Method 1: window.location direct
                                                const win = window.open(url, '_blank');
                                                if (win) {
                                                  win.focus();
                                                  console.log('Window opened success method 1');
                                                } else {
                                                  // Method 2: Create and click a link
                                                  const link = document.createElement('a');
                                                  link.href = url;
                                                  link.setAttribute('target', '_blank');
                                                  link.setAttribute('rel', 'noopener noreferrer');
                                                  document.body.appendChild(link);
                                                  link.click();
                                                  document.body.removeChild(link);
                                                  console.log('Window opened success method 2');
                                                }
                                              } catch (err) {
                                                console.error('Failed to open link:', err);
                                                // Last resort: change window location
                                                alert(`Can't open in new tab. Redirecting to: ${url}`);
                                                window.location.href = url;
                                              }
                                            }}
                                          >
                                            Learn More
                                          </div>
                                        );
                                      }
                                      return null;
                                    } catch (e) {
                                      console.error("Error parsing additionalData:", e);
                                      return null;
                                    }
                                  })()}
                                </div>
                                
                                {/* Remove Button */}
                                <button 
                                  className="inline-flex items-center text-sm font-medium text-rose-600 hover:text-rose-800 mt-1"
                                  onClick={() => handleRemoveEvent(event.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">No Events Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Start swiping to build your schedule</p>
        </div>
      )}
    </div>
  );
}

// Convert time string (HH:MM) to minutes since midnight for sorting
function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
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