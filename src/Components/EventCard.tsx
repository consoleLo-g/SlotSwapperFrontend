// src/Components/EventCard.tsx
import type { AppEvent } from "../Types/Event";

interface EventCardProps {
  ev: AppEvent;
  onMakeSwappable?: (id: string) => void;
  className?: string; 
  statusColor?: string; // ✅ add statusColor
}

export default function EventCard({ ev, onMakeSwappable, className, statusColor }: EventCardProps) {
  return (
    <div
      className={`p-3 rounded-lg shadow ${className ?? ""}`}
      style={{ backgroundColor: statusColor ?? "#fff" }}
    >
      <h3 className="font-semibold text-lg">{ev.title}</h3>
      <p className="text-gray-700 text-sm">
        {new Date(ev.start).toLocaleString()} - {new Date(ev.end).toLocaleString()}
      </p>
      {!ev.swappable && (
  <button
    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    onClick={() => onMakeSwappable && onMakeSwappable(ev.id)}
  >
    Make Swappable
  </button>
)}

    </div>
  );
}
