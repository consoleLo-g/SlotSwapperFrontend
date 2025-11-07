import type { AppEvent } from "../Types/Event";

interface EventCardProps {
  ev: AppEvent;
  onMakeSwappable?: (id: string) => void;
  className?: string;
  statusColor?: string;
  children?: React.ReactNode;
  showTitle?: boolean;
  hideTime?: boolean;
}

export default function EventCard({
  ev,
  onMakeSwappable,
  className,
  statusColor,
  children,
  showTitle = true,
  hideTime,
}: EventCardProps) {
  const formatTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || !timeStr) return "N/A";

  const [hours, minutes] = timeStr.split(":").map(Number);

  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};


  const startTime = formatTime(ev.date, ev.startTime);
  const endTime = formatTime(ev.date, ev.endTime);

  return (
    <div
      className={`p-3 rounded-lg shadow ${className ?? ""}`}
      style={{ backgroundColor: statusColor ?? "#fff" }}
    >
      {showTitle && <h3 className="font-semibold text-lg">{ev.title}</h3>}
      {!hideTime && (
  <p className="text-gray-700 text-sm">
    {startTime} - {endTime}
  </p>
)}


      {!ev.swappable && onMakeSwappable && (
        <button
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={() => onMakeSwappable(ev.id)}
        >
          Make Swappable
        </button>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
