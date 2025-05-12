import { Event } from "@shared/schema";
import { X } from "lucide-react";
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
          <div className="flex items-start mb-3">
            <span className={`inline-block ${getEventTypeStyle(event.type)} text-xs px-2 py-1 rounded-full font-medium`}>
              {capitalizeFirstLetter(event.type)}
            </span>
            <div className="ml-auto text-right text-sm text-gray-600">
              <div>{format(parseISO(event.date), "MMM d")}</div>
              <div>{formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
          
          {event.speakers && event.speakers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Speakers</h3>
              <div className="flex space-x-2">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mb-1 overflow-hidden flex items-center justify-center text-gray-500">
                      {speaker.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600">{speaker}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {event.description}
            </p>
          </div>
          
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
