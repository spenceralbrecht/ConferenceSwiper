import { Event } from "@shared/schema";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar } from "lucide-react";

interface EventCardProps {
  event: Event;
  drag?: boolean;
}

export default function EventCard({ event, drag = false }: EventCardProps) {
  // Convert event type to display-friendly format and determine badge color
  // Using Airbnb-inspired color palette
  const getTypeBadgeStyle = () => {
    switch (event.type) {
      case "main":
        return "bg-rose-100 text-rose-800";
      case "workshop":
        return "bg-teal-100 text-teal-800";
      case "panel":
        return "bg-amber-100 text-amber-800";
      case "networking":
        return "bg-cyan-100 text-cyan-800";
      case "breakout":
        return "bg-fuchsia-100 text-fuchsia-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Format date display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Format time display (HH:MM to h:MM AM/PM)
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Since we don't have images, don't define an image URL
  // const imageUrl = event.imageUrl || getDefaultImageForType(event.type);
  
  // Determine if this is a MAU Vegas event (for display customization)
  const isMauEvent = event.date.startsWith('2025-05');
  
  // For MAU events, map 'main' and 'networking' (side) to more descriptive labels
  const getEventTypeLabel = () => {
    if (isMauEvent) {
      return event.type === 'main' ? 'Official Event' : 'Side Event';
    }
    return capitalizeFirstLetter(event.type);
  };

  console.log("Rendering event card:", event.title);
  
  // Get color based on event type (using Airbnb-inspired colors)
  const getCardBorderColor = () => {
    switch (event.type) {
      case "main":
        return "#FF5A5F"; // Airbnb red
      case "networking":
        return "#00A699"; // Airbnb teal
      default:
        return "#484848"; // Airbnb dark gray
    }
  };
  
  return (
    <div 
      className="rounded-xl bg-white shadow-lg overflow-hidden h-full relative"
      style={{ 
        minHeight: "420px", 
        background: "#ffffff",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.05)",
        border: `1px solid ${getCardBorderColor()}`,
      }}
    >
      {/* Event type header banner instead of image */}
      <div 
        className="py-3 px-4 border-b border-gray-200"
        style={{ 
          backgroundColor: event.type === 'main' ? '#FF5A5F' : '#00A699',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0))',
          color: 'white'
        }}
      >
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold py-1 px-3 bg-white bg-opacity-20 rounded-full shadow-sm">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Category badge at top */}
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-block ${getTypeBadgeStyle()} text-xs px-2 py-1 rounded-md font-medium shadow-sm`}>
            {getEventTypeLabel()}
          </span>
        </div>
        
        {/* Event title with large clear font */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{event.title}</h2>
        
        {/* Info section with improved readability */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-rose-500 flex-shrink-0" />
            <span className="text-base font-medium text-gray-700">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-3 text-rose-500 flex-shrink-0" />
            <span className="text-base font-medium text-gray-700">{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>
          
          <div className="flex items-start">
            <MapPin className="h-5 w-5 mr-3 mt-0.5 text-rose-500 flex-shrink-0" />
            <span className="text-base font-medium text-gray-700 line-clamp-1">{event.location}</span>
          </div>
        </div>
        
        {/* Description with better readability */}
        <div className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
          {event.description}
        </div>
        
        <div className="flex flex-col mt-6 pt-3 border-t border-gray-100">
          {/* Show sponsor information if available */}
          {event.additionalData && (() => {
            try {
              const additionalData = JSON.parse(event.additionalData);
              if (additionalData.sponsors) {
                return (
                  <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full self-start mb-2">
                    Sponsored by {additionalData.sponsors}
                  </div>
                );
              }
              return null;
            } catch (e) {
              return null;
            }
          })()}
          
          {/* Add action button indicator if available */}
          <div className="flex justify-center w-full my-2">
            {event.additionalData && (() => {
              try {
                // Log the raw additionalData to help with debugging
                console.log(`Event ${event.id} additionalData:`, event.additionalData);
                
                const additionalData = JSON.parse(event.additionalData || '{}');
                
                // First priority: Action + ActionLink
                if (additionalData.action && additionalData.actionLink) {
                  const url = additionalData.actionLink.startsWith('http') 
                    ? additionalData.actionLink 
                    : `https://mauvegas.com/${additionalData.actionLink}`;
                  
                  console.log(`Event ${event.id} RSVP button URL:`, url);
                  
                  return (
                    <a 
                      className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-5 rounded-md text-sm transition-colors shadow-md"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Log click event to help with debugging
                        console.log(`Clicked RSVP button for event ${event.id}:`, url);
                      }}
                    >
                      {additionalData.action || "RSVP"}
                    </a>
                  );
                }
                
                // Second priority: DetailsLink
                if (additionalData.detailsLink) {
                  const url = additionalData.detailsLink.startsWith('http') 
                    ? additionalData.detailsLink 
                    : `https://mauvegas.com/${additionalData.detailsLink}`;
                  
                  console.log(`Event ${event.id} Learn More button URL:`, url);
                  
                  return (
                    <a 
                      href={url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-5 rounded-md text-sm transition-colors shadow-md"
                      onClick={(e) => {
                        // Log click event to help with debugging
                        console.log(`Clicked Learn More button for event ${event.id}:`, url);
                      }}
                    >
                      Learn More
                    </a>
                  );
                }
                
                return null;
              } catch (e) {
                console.error("Error parsing additionalData:", e);
                return null;
              }
            })()}
          </div>
        </div>
      </div>
      
      {/* Action Overlays for swipe gestures */}
      <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center font-bold opacity-0 action-interested">
        <div className="text-center bg-green-100 bg-opacity-80 p-4 rounded-full">
          <div className="text-4xl">👍</div>
          <div className="text-xl font-semibold mt-2">Interested</div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold opacity-0 action-not-interested">
        <div className="text-center bg-red-100 bg-opacity-80 p-4 rounded-full">
          <div className="text-4xl">👎</div>
          <div className="text-xl font-semibold mt-2">Skip</div>
        </div>
      </div>
    </div>
  );
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// No longer need default images since we don't show images
// function getDefaultImageForType(type: string): string {
//   // Removed functionality
// }
