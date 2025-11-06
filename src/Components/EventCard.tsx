import type { AppEvent } from "../Types/Event";

interface EventCardProps {
  ev: AppEvent;
  onMakeSwappable?: (id: string) => void;
  className?: string;
  statusColor?: string;
  children?: React.ReactNode;
  showTitle?: boolean;
}

export default function EventCard({
  ev,
  onMakeSwappable,
  className,
  statusColor,
  children,
  showTitle = true
}: EventCardProps) {
  const startDate = new Date(`${ev.date}T${ev.startTime}`);
  const endDate = new Date(`${ev.date}T${ev.endTime}`);

  return (
    <div className={`p-3 rounded-lg shadow ${className ?? ""}`} style={{ backgroundColor: statusColor ?? "#fff" }}>
      {showTitle && <h3 className="font-semibold text-lg">{ev.title}</h3>}
      <p className="text-gray-700 text-sm">
        {startDate.toLocaleTimeString()} - {endDate.toLocaleTimeString()}
      </p>

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
