import { useState, useRef, useEffect } from "react";
import { Event } from "@shared/schema";
import EventCard from "@/components/EventCard";
import EventDetailModal from "@/components/EventDetailModal";
import FilterPanel from "@/components/FilterPanel";
import { useSchedule } from "@/hooks/use-schedule";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { X, Check, Info } from "lucide-react";

interface SwipeScreenProps {
  events: Event[];
}

export default function SwipeScreen({ events }: SwipeScreenProps) {
  console.log("SwipeScreen component mounted");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewableEvents, setViewableEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeFilters, setActiveFilters] = useState<{
    main: boolean;
    workshop: boolean;
    panel: boolean;
    networking: boolean;
    breakout: boolean;
    other: boolean;
  }>({
    main: true,
    workshop: true,
    panel: true,
    networking: true,
    breakout: true,
    other: true,
  });
  
  const { interestedEvents, notInterestedEvents, addInterested, addNotInterested, isEventRated } = useSchedule();
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  
  // Filter events based on user preferences and add debugging
  useEffect(() => {
    console.log("Events passed to SwipeScreen:", events.length);
    
    const filtered = events.filter(
      (event) => activeFilters[event.type as keyof typeof activeFilters]
    );
    
    console.log("Events after filter:", filtered.length);
    setViewableEvents(filtered);
  }, [events, activeFilters]);
  
  const remainingEvents = viewableEvents.filter(
    (event) => !isEventRated(event.id)
  );
  
  console.log("Remaining events to swipe:", remainingEvents.length);
  
  const currentEvent = remainingEvents[currentIndex];
  
  console.log("Current event:", currentEvent);
  
  const handleDragEnd = async (
    _: any,
    info: PanInfo
  ) => {
    const threshold = 100;
    const xOffset = info.offset.x;
    
    if (xOffset > threshold) {
      // Swiped right - Interested
      console.log("Swiped right (interested):", currentEvent.id);
      await controls.start({ x: "120%", rotate: 30, opacity: 0 });
      addInterested(currentEvent);
      nextCard();
    } else if (xOffset < -threshold) {
      // Swiped left - Not Interested
      console.log("Swiped left (not interested):", currentEvent.id);
      await controls.start({ x: "-120%", rotate: -30, opacity: 0 });
      addNotInterested(currentEvent);
      nextCard();
    } else {
      // Reset position
      controls.start({ x: 0, rotate: 0 });
    }
  };
  
  const nextCard = () => {
    controls.start({ x: 0, rotate: 0, opacity: 1 });
    if (currentIndex < remainingEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleSwipeRight = async () => {
    if (!currentEvent) return;
    console.log("Button: Liked event", currentEvent.id);
    await controls.start({ x: "120%", rotate: 30, opacity: 0 });
    addInterested(currentEvent);
    nextCard();
  };
  
  const handleSwipeLeft = async () => {
    if (!currentEvent) return;
    console.log("Button: Disliked event", currentEvent.id);
    await controls.start({ x: "-120%", rotate: -30, opacity: 0 });
    addNotInterested(currentEvent);
    nextCard();
  };
  
  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Debug output for our app state
  console.log("Event Card Debug:", {
    totalEvents: events.length,
    filteredEvents: viewableEvents.length,
    remainingEvents: remainingEvents.length,
    currentIndex: currentIndex,
    currentEvent: currentEvent ? currentEvent.title : 'No current event'
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="text-xs text-gray-500 font-medium">
          Events remaining: <span>{remainingEvents.length - currentIndex}</span>
        </div>
        <button onClick={toggleFilter} className="p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      <FilterPanel 
        isVisible={showFilter} 
        filters={activeFilters} 
        onFilterChange={setActiveFilters} 
      />

      <div className="swipe-container relative flex-1 mx-4 mb-4 rounded-xl overflow-hidden border border-gray-200" ref={constraintsRef}>
        {/* Debug Banner - will remove once fixed */}
        <div className="absolute top-0 left-0 right-0 bg-blue-100 text-blue-800 text-xs p-1 text-center z-50">
          {remainingEvents.length} events available to swipe
        </div>
        
        {remainingEvents.length > 0 && currentEvent ? (
          <motion.div
            className="absolute inset-0 w-full h-full"
            drag="x"
            dragConstraints={constraintsRef}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ opacity: 1 }}
            style={{ zIndex: 10 }}
          >
            <EventCard 
              event={currentEvent} 
              onViewDetails={() => openEventDetails(currentEvent)}
              drag
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700">All Done!</h3>
            <p className="mt-1 text-sm text-gray-500">You've gone through all available events.</p>
            <p className="mt-4 text-sm text-gray-500">Check your schedule to see your selected events.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-6 pb-6">
        <button 
          className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200"
          onClick={handleSwipeLeft}
          disabled={!currentEvent}
        >
          <X className="h-8 w-8 text-red-500" />
        </button>
        <button 
          className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200"
          onClick={() => currentEvent && openEventDetails(currentEvent)}
          disabled={!currentEvent}
        >
          <Info className="h-6 w-6 text-blue-500" />
        </button>
        <button 
          className="w-14 h-14 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-200"
          onClick={handleSwipeRight}
          disabled={!currentEvent}
        >
          <Check className="h-8 w-8 text-green-500" />
        </button>
      </div>

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          isVisible={showModal} 
          onClose={() => setShowModal(false)} 
          onInterested={() => {
            addInterested(selectedEvent);
            setShowModal(false);
          }}
          onNotInterested={() => {
            addNotInterested(selectedEvent);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}