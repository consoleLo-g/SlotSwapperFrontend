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

  // ✅ Convert backend format → frontend format
 return res.data.map((e: any) => ({
  id: e._id || e.id,
  title: e.title,
  description: e.description,
  swappable: e.swappable,
  userId: e.userId,

  // frontend ISO format
  start: new Date(`${e.date}T${e.startTime}`).toISOString(),
  end: new Date(`${e.date}T${e.endTime}`).toISOString(),

  // ✅ keep backend fields
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
}));

});

// Create a new event
export const createEvent = createAsyncThunk(
  "events/create",
  async ({
    title,
    start,
    end,
    description = "",
  }: {
    title: string;
    start: Date;
    end: Date;
    description?: string;
  }) => {
    const userId = localStorage.getItem("userId") || "";

    const date = format(start, "yyyy-MM-dd");
    const startTime = format(start, "HH:mm");
    const endTime = format(end, "HH:mm");

    const res = await createEventApi({
      userId,
      title,
      description,
      date,
      startTime,
      endTime,
    });

    return res.data;
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
  const e = action.payload;

  state.items.push({
    id: e.id,
    title: e.title,
    description: e.description,
    swappable: e.swappable,
    userId: e.userId,

    // ✅ Convert backend fields → ISO
    start: new Date(`${e.date}T${e.startTime}`).toISOString(),
    end: new Date(`${e.date}T${e.endTime}`).toISOString(),

    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
  });
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
