import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if two time ranges overlap
export function checkTimeConflict(
  startTime1: string,
  endTime1: string,
  startTime2: string,
  endTime2: string
): boolean {
  const [startHour1, startMinute1] = startTime1.split(":").map(Number);
  const [endHour1, endMinute1] = endTime1.split(":").map(Number);
  const [startHour2, startMinute2] = startTime2.split(":").map(Number);
  const [endHour2, endMinute2] = endTime2.split(":").map(Number);

  const start1 = startHour1 * 60 + startMinute1;
  const end1 = endHour1 * 60 + endMinute1;
  const start2 = startHour2 * 60 + startMinute2;
  const end2 = endHour2 * 60 + endMinute2;

  // Check if one event starts during the other
  return (start1 < end2 && start2 < end1);
}

// Get CSS style for event type badge
export function getEventTypeStyle(type: string): string {
  switch (type) {
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
}

// Format time string (HH:MM to h:MM AM/PM)
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Capitalize first letter of a string
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format date string (YYYY-MM-DD to Month Day)
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
