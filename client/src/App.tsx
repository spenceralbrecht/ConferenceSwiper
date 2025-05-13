import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SwipeScreen from "@/pages/SwipeScreen";
import ScheduleScreen from "@/pages/ScheduleScreen";
import TabNavigator from "@/components/TabNavigator";
import { Event } from "@shared/schema";
import { loadEvents } from "@/lib/csvParser";

function Router() {
  const [tab, setTab] = useState<"discover" | "schedule">("discover");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log("Loading event data");
      try {
        const data = await loadEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg h-screen flex flex-col overflow-hidden border border-gray-300 relative">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">MAU Vegas 2025</h1>
          <p className="text-xs text-gray-500">Conference Event Scheduler</p>
        </div>
        {/* Add event counter */}
        <div className="text-xs text-primary font-medium bg-blue-50 px-2 py-1 rounded-full">
          {events.length} Events
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-16" style={{ height: "calc(100vh - 120px)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {tab === "discover" && <SwipeScreen events={events} />}
            {tab === "schedule" && <ScheduleScreen events={events} />}
          </>
        )}
      </main>

      <div className="w-full fixed bottom-0 left-0 right-0" style={{ maxWidth: "448px", margin: "0 auto" }}>
        <TabNavigator currentTab={tab} onChange={setTab} />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
