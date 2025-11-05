import React, { useState, useEffect } from "react";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, start: Date, end: Date) => void;
  defaultDate?: Date | null;
}

export default function AddEventModal({ open, onClose, onCreate, defaultDate }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  useEffect(() => {
    if (!defaultDate) return;
    setStartTime("09:00");
    setEndTime("10:00");
  }, [defaultDate]);

  const handleSubmit = () => {
    if (!defaultDate) return;
    const start = new Date(defaultDate);
    const [sh, sm] = startTime.split(":").map(Number);
    start.setHours(sh, sm);

    const end = new Date(defaultDate);
    const [eh, em] = endTime.split(":").map(Number);
    end.setHours(eh, em);

    onCreate(title, start, end);
    setTitle("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl p-6 z-10 w-full max-w-md shadow-xl transition-transform transform scale-95 animate-scale-in">
        <h3 className="text-xl font-bold mb-4">Add Event</h3>
        <div className="mb-2">
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="mb-2 flex gap-2">
          <div>
            <label className="block font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
