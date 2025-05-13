import { Event } from "@shared/schema";
import { X, Calendar, Clock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { getEventTypeStyle } from "@/lib/utils";

interface EventDetailModalProps {
  event: Event;
  isVisible: boolean;
  onClose: () => void;
  onInterested?: () => void;
  onNotInterested?: () => void;
  onRemove?: () => void;
  isScheduled?: boolean;
}

export default function EventDetailModal({
  event,
  isVisible,
  onClose,
  onInterested,
  onNotInterested,
  onRemove,
  isScheduled = false
}: EventDetailModalProps) {
  if (!isVisible) return null;
  
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
  
  // Format date to include year for conference events
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric", year: "numeric" });
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div 
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          ></div>
          <button 
            className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-2"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-3">
            <span className={`inline-block ${getEventTypeStyle(event.type)} text-xs px-2 py-1 rounded-full font-medium`}>
              {getEventTypeLabel()}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">{event.title}</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
          
          {event.speakers && event.speakers.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Speakers</h3>
              <div className="flex flex-wrap gap-2">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200">
                    <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center text-gray-600 text-xs mr-1">
                      {speaker.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-700">{speaker}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
              {event.description}
            </p>
          </div>
          
          {/* Action buttons from the CSV data */}
          {event.additionalData && (
            <div className="mb-4">
              {(() => {
                try {
                  const additionalData = JSON.parse(event.additionalData);
                  if (additionalData.action && additionalData.actionLink) {
                    return (
                      <a 
                        href={additionalData.actionLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded text-center mb-3"
                      >
                        {additionalData.action}
                      </a>
                    );
                  }
                  return null;
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          )}
          
          <div className="flex space-x-3">
            {isScheduled ? (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={onRemove}
              >
                Remove from Schedule
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onNotInterested}
                >
                  Not Interested
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={onInterested}
                >
                  I'm Interested
                </Button>
              </>
            )}
          </div>
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
