// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchEvents, makeSwappable } from "../Store/eventSlice";
import EventCard from "../Components/EventCard";
import NavBar from "../Components/NavBar";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((s) => s.events.items);
  const loading = useAppSelector((s) => s.events.loading);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<typeof events>([]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Filter events for the selected date
  useEffect(() => {
    if (!selectedDate) return;

    const dayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0, 0, 0
    );

    const dayEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23, 59, 59
    );

    setSelectedDayEvents(
      events.filter((ev) => {
        const s = new Date(ev.start);
        return s >= dayStart && s <= dayEnd;
      })
    );
  }, [selectedDate, events]);

  // Convert to proper Date objects
  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      })),
    [events]
  );

  function handleSelectSlot(slot: any) {
    if (slot.start) setSelectedDate(new Date(slot.start));
  }

  async function handleMakeSwappable(id: string) {
    await dispatch(makeSwappable(id));
    dispatch(fetchEvents());
  }

  return (
    <div>
      <NavBar />
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">

        {/* Calendar Section */}
        <section className="col-span-8 bg-white/90 rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded">Month</button>
              <button className="px-2 py-1 border rounded">Week</button>
              <button className="px-2 py-1 border rounded">Day</button>
            </div>

            <div className="text-sm text-gray-600">
              Selected: {selectedDate ? selectedDate.toDateString() : "—"}
            </div>
          </div>

          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents as any}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onDoubleClickEvent={(ev) => {
                const e = ev as any; // minimal fix
                alert(`Event: ${e.title}`);
              }}              
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              popup
              style={{ height: "100%" }}
              eventPropGetter={(event) => {
                const status = (event as any).status;
                const style: React.CSSProperties = {
                  borderRadius: 6,
                  color: "white",
                  padding: "2px 6px",
                };

                if (status === "BUSY") style.backgroundColor = "#ef4444";
                else if (status === "SWAPPABLE") style.backgroundColor = "#3b82f6";
                else if (status === "CONFIRMED") style.backgroundColor = "#10b981";

                return { style };
              }}
            />
          </div>
        </section>

        {/* Side Panel */}
        <aside className="col-span-4 bg-white/90 rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-pink-700 mb-3">
            Events of Day
          </h2>

          <div className="space-y-3 overflow-auto max-h-[520px]">
            {loading ? (
              <div>Loading...</div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-gray-500 italic">No events this day</div>
            ) : (
              selectedDayEvents.map((ev) => (
                <EventCard key={ev.id} ev={ev} onMakeSwappable={handleMakeSwappable} />
              ))
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
