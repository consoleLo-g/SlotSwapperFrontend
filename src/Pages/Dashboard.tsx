import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type DateCellWrapperProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchEvents, makeSwappable, createEvent } from "../Store/eventSlice";
import EventCard from "../Components/EventCard";
import NavBar from "../Components/NavBar";
import AddEventModal from "../Components/AddEventModal";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((s) => s.events.items);
  const loading = useAppSelector((s) => s.events.loading);

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<typeof events>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // ✅ FIXED — correct filtering by converting event.start to Date()
  useEffect(() => {
    if (!selectedDate) return;

    const dayStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0
    );

    const dayEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59
    );

    setSelectedDayEvents(
      events.filter((ev) => {
        const s = new Date(ev.start);
        return s >= dayStart && s <= dayEnd;
      })
    );
  }, [selectedDate, events]);

  // ✅ FIXED — Proper RBC event conversion (NO AppEvent type override)
  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        title: e.title,
        start: new Date(e.start), // REQUIRED by RBC
        end: new Date(e.end),
        id: e.id,
        description: e.description,
        swappable: e.swappable,
        status: e.status,
        ownerId: e.ownerId,
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

  async function handleCreateEvent(title: string, start: Date, end: Date) {
    await dispatch(createEvent({ title, start, end }));
    dispatch(fetchEvents());
  }

  const DateCellWrapper = ({ children, value }: DateCellWrapperProps) => (
    <div className="relative w-full h-full group transition-all duration-200">
      {children}
      <button
        onClick={() => {
          setSelectedDate(value);
          setShowAddModal(true);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-green-600 font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:scale-110 transition-transform duration-200 z-10"
        title="Add Event"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Calendar */}
        <section className="col-span-8 bg-white rounded-2xl shadow p-4">
          <div className="mb-4 flex justify-end">
            <button
              className="px-4 py-2 bg-linear-to-r from-indigo-500 to-pink-500 text-white rounded-full hover:scale-105 transition-transform"
              onClick={() => setShowAddModal(true)}
            >
              + Add Event
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {["Month", "Week", "Day"].map((view) => (
                <button
                  key={view}
                  className="px-3 py-1 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 transition"
                >
                  {view}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-700 font-medium">
              Selected: {selectedDate ? selectedDate.toDateString() : "—"}
            </div>
          </div>

          <div style={{ height: 600 }} className="rounded-xl overflow-hidden shadow-inner">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onDoubleClickEvent={(ev) => alert(`Event: ${ev.title}`)}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              popup
              components={{ dateCellWrapper: DateCellWrapper }}
              style={{ height: "100%" }}
              eventPropGetter={() => ({
                style: {
                  borderRadius: 12,
                  color: "#111827",
                  padding: "4px 8px",
                  fontWeight: 600,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                },
              })}
            />
          </div>
        </section>

        {/* Side panel */}
        <aside className="col-span-4 bg-white rounded-2xl shadow p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Events of Day</h2>
          <div className="space-y-3 overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {loading ? (
              <div className="text-gray-500 font-medium">Loading...</div>
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

      <AddEventModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreateEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
