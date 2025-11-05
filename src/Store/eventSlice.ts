// src/store/eventSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchMyEventsApi,
  createEventApi,
  makeSwappableApi,
  updateEventApi,
} from "../api/eventApi";
import type { AppEvent } from "../Types/Event";
import { format } from "date-fns";

// Fetch user events
export const fetchEvents = createAsyncThunk("events/fetchAll", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) throw new Error("User not logged in");
  const res = await fetchMyEventsApi(userId);
  return res.data as AppEvent[];
});

// Create a new event
export const createEvent = createAsyncThunk(
  "events/create",
  async ({
    title,
    start,
    end,
    description,
  }: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
  }) => {
    const userId = localStorage.getItem("userId") || "";

    // Convert Date objects to backend strings
    const date = format(start, "dd-MM-yyyy");       // e.g., "05-11-2025"
    const startTime = format(start, "HH:mm");       // e.g., "17:00"
    const endTime = format(end, "HH:mm");           // e.g., "19:00"

    const res = await createEventApi({ userId, title, description, date, startTime, endTime });
    return res.data as AppEvent;
  }
);

// Make an event swappable
export const makeSwappable = createAsyncThunk(
  "events/makeSwappable",
  async (id: string) => {
    const res = await makeSwappableApi(id);
    return res.data as AppEvent;
  }
);

// Update an event
export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, payload }: { id: string; payload: Partial<AppEvent> }) => {
    const res = await updateEventApi(id, payload);
    return res.data as AppEvent;
  }
);

const slice = createSlice({
  name: "events",
  initialState: { items: [] as AppEvent[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch events
    builder.addCase(fetchEvents.pending, (state) => { state.loading = true; });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchEvents.rejected, (state) => { state.loading = false; });

    // Create event
    builder.addCase(createEvent.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // Make swappable
    builder.addCase(makeSwappable.fulfilled, (state, action) => {
      state.items = state.items.map(ev =>
        ev.id === action.payload.id ? action.payload : ev
      );
    });

    // Update event
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      state.items = state.items.map(ev =>
        ev.id === action.payload.id ? action.payload : ev
      );
    });
  },
});

export default slice.reducer;
