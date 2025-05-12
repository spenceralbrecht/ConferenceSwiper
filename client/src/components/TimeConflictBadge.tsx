import { AlertTriangle } from "lucide-react";

export default function TimeConflictBadge() {
  return (
    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center animate-pulse">
      <AlertTriangle className="h-3 w-3 mr-1" />
      <span>Conflict</span>
    </span>
  );
}
