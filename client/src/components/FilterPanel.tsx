import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  isVisible: boolean;
  filters: {
    main: boolean;
    workshop: boolean;
    panel: boolean;
    networking: boolean;
    breakout: boolean;
    other: boolean;
  };
  onFilterChange: (filters: FilterPanelProps["filters"]) => void;
}

export default function FilterPanel({ isVisible, filters, onFilterChange }: FilterPanelProps) {
  if (!isVisible) return null;

  const handleChange = (type: keyof typeof filters) => {
    const updatedFilters = {
      ...filters,
      [type]: !filters[type]
    };
    onFilterChange(updatedFilters);
  };

  return (
    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 transition-all">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Show:</span>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.main}
            onCheckedChange={() => handleChange("main")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Main Events</span>
        </Label>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.workshop}
            onCheckedChange={() => handleChange("workshop")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Workshops</span>
        </Label>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.panel}
            onCheckedChange={() => handleChange("panel")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Panels</span>
        </Label>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.networking}
            onCheckedChange={() => handleChange("networking")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Networking</span>
        </Label>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.breakout}
            onCheckedChange={() => handleChange("breakout")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Breakout</span>
        </Label>
        <Label className="inline-flex items-center cursor-pointer">
          <Checkbox 
            checked={filters.other}
            onCheckedChange={() => handleChange("other")}
            className="h-4 w-4 text-primary rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700">Other</span>
        </Label>
      </div>
    </div>
  );
}
