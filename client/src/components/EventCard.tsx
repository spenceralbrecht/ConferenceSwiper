import { Event } from "@shared/schema";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface EventCardProps {
  event: Event;
  onViewDetails: () => void;
  drag?: boolean;
}

export default function EventCard({ event, onViewDetails, drag = false }: EventCardProps) {
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  return (
    <div 
      className="rounded-xl bg-white shadow-lg overflow-hidden h-full"
      onClick={onViewDetails}
    >
      <div 
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      ></div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block ${getTypeBadgeStyle()} text-xs px-2 py-1 rounded-full font-medium`}>
              {capitalizeFirstLetter(event.type)}
            </span>
            <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{formatDate(event.date)}</div>
            <div>{formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
          </div>
        </div>
        <div className="mt-2 text-gray-600 text-sm line-clamp-2">
          {event.description}
        </div>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{event.location}</span>
        </div>
      </div>
      
      {/* Action Overlays for swipe gestures */}
      <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center font-bold opacity-0 action-interested">
        <div className="text-center">
          <div className="text-4xl">👍</div>
          <div className="text-xl font-semibold mt-2">Interested</div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center font-bold opacity-0 action-not-interested">
        <div className="text-center">
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
      return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "workshop":
      return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "panel":
      return "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "networking":
      return "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    case "breakout":
      return "https://images.unsplash.com/photo-1528605105345-5344ea20e269?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
    default:
      return "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=350";
  }
}
