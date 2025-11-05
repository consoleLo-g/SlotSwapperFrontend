// src/components/EventCard.tsx
import React from "react";
import type { AppEvent } from "../Types/Event";

export default function EventCard({ ev, onMakeSwappable }: { ev: AppEvent; onMakeSwappable?: (id: string) => void }) {
  return (
    <div className="p-3 rounded-lg shadow-md bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 text-gray-900">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold">{ev.title}</div>
          <div className="text-sm text-gray-700">{new Date(ev.start).toLocaleString()}</div>
        </div>
        <div className="text-xs px-2 py-1 rounded bg-white/40">{ev.status}</div>
      </div>
      <div className="mt-2 flex gap-2">
        {ev.status === "BUSY" && (
          <button className="px-2 py-1 bg-indigo-600 text-white rounded text-sm" onClick={() => onMakeSwappable?.(ev.id)}>
            Make Swappable
          </button>
        )}
      </div>
    </div>
  );
}
