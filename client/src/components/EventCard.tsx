import { Event } from "@shared/schema";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar } from "lucide-react";

interface EventCardProps {
  event: Event;
  onViewDetails: () => void;
  drag?: boolean;
}

export default function EventCard({ event, onViewDetails = () => {}, drag = false }: EventCardProps) {
  // Convert event type to display-friendly format and determine badge color
  const getTypeBadgeStyle = () => {
    switch (event.type) {
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

  // Define image URL with a fallback based on event type
  const imageUrl = event.imageUrl || getDefaultImageForType(event.type);
  
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
  
  // Get color based on event type
  const getCardBorderColor = () => {
    switch (event.type) {
      case "main":
        return "#3b82f6"; // blue
      case "networking":
        return "#8b5cf6"; // purple
      default:
        return "#d1d5db"; // gray
    }
  };
  
  return (
    <div 
      className="rounded-xl bg-white shadow-lg overflow-hidden h-full relative"
      onClick={onViewDetails}
      style={{ 
        minHeight: "500px", 
        background: "#ffffff",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: `2px solid ${getCardBorderColor()}`,
      }}
    >
      {/* Event type header banner instead of image */}
      <div 
        className="py-3 px-4 border-b border-gray-200 font-semibold"
        style={{ 
          backgroundColor: event.type === 'main' ? '#3b82f6' : '#8b5cf6',
          color: 'white'
        }}
      >
        <div className="flex justify-between items-center">
          <div>{event.type === 'main' ? 'Official Event' : 'Side Event'}</div>
          <div className="text-xs font-normal py-1 px-2 bg-white bg-opacity-20 rounded-full">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <span className={`inline-block ${getTypeBadgeStyle()} text-xs px-2 py-1 rounded-full font-medium`}>
              {getEventTypeLabel()}
            </span>
            <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
          </div>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{formatDate(event.date)}</span>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
        </div>
        
        <div className="mt-1 flex items-start text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        {/* Show sponsor information if available */}
        {event.additionalData && (() => {
          try {
            const additionalData = JSON.parse(event.additionalData);
            if (additionalData.sponsors) {
              return (
                <div className="mt-2 text-xs text-gray-400 italic">
                  Sponsored by {additionalData.sponsors}
                </div>
              );
            }
            return null;
          } catch (e) {
            return null;
          }
        })()}
        
        <div className="mt-2 text-gray-600 text-sm line-clamp-2">
          {event.description}
        </div>
        
        {/* Add action button indicator if available */}
        {event.additionalData && (() => {
          try {
            const additionalData = JSON.parse(event.additionalData);
            if (additionalData.action && additionalData.actionLink) {
              return (
                <div className="mt-4">
                  <a 
                    href={additionalData.actionLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {additionalData.action}
                  </a>
                </div>
              );
            }
            return null;
          } catch (e) {
            return null;
          }
        })()}
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

function getDefaultImageForType(type: string): string {
  switch (type) {
    case "main":
      return "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "workshop":
      return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "panel":
      return "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "networking":
      return "https://images.unsplash.com/photo-1577202214328-c04b77cefb5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "breakout":
      return "https://images.unsplash.com/photo-1528605105345-5344ea20e269?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    default:
      return "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
  }
}
