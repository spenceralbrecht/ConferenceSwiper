import { Calendar, Layers } from "lucide-react";

interface TabNavigatorProps {
  currentTab: "discover" | "schedule";
  onChange: (tab: "discover" | "schedule") => void;
}

export default function TabNavigator({ currentTab, onChange }: TabNavigatorProps) {
  return (
    <nav className="flex border-t border-gray-200 bg-white shadow-md">
      <button 
        className={`flex-1 py-3 flex flex-col items-center ${currentTab === "discover" ? "text-primary" : "text-gray-500"}`}
        onClick={() => onChange("discover")}
      >
        <Layers className="h-6 w-6" />
        <span className="text-xs mt-1 font-medium">Discover</span>
      </button>
      <button 
        className={`flex-1 py-3 flex flex-col items-center ${currentTab === "schedule" ? "text-primary" : "text-gray-500"}`}
        onClick={() => onChange("schedule")}
      >
        <Calendar className="h-6 w-6" />
        <span className="text-xs mt-1 font-medium">My Schedule</span>
      </button>
    </nav>
  );
}
