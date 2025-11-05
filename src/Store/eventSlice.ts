// src/store/eventSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchMyEventsApi, createEventApi, makeSwappableApi, updateEventApi } from "../api/eventApi";
import type { AppEvent } from "../Types/Event";

export const fetchEvents = createAsyncThunk("events/fetchAll", async () => {
  const res = await fetchMyEventsApi();
  return res.data as AppEvent[];
});

export const createEvent = createAsyncThunk("events/create", async (payload: Partial<AppEvent>) => {
  const res = await createEventApi(payload);
  return res.data as AppEvent;
});

export const makeSwappable = createAsyncThunk("events/makeSwappable", async (id: string) => {
  const res = await makeSwappableApi(id);
  return res.data as AppEvent;
});

export const updateEvent = createAsyncThunk("events/update", async ({ id, payload }: { id: string; payload: Partial<AppEvent> }) => {
  const res = await updateEventApi(id, payload);
  return res.data as AppEvent;
});

const slice = createSlice({
  name: "events",
  initialState: { items: [] as AppEvent[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEvents.pending, (s) => { s.loading = true; });
    builder.addCase(fetchEvents.fulfilled, (s, a) => { s.items = a.payload; s.loading = false; });
    builder.addCase(fetchEvents.rejected, (s) => { s.loading = false; });

    builder.addCase(createEvent.fulfilled, (s, a) => { s.items.push(a.payload); });
    builder.addCase(makeSwappable.fulfilled, (s, a) => {
      s.items = s.items.map((ev) => (ev.id === a.payload.id ? a.payload : ev));
    });
    builder.addCase(updateEvent.fulfilled, (s, a) => {
      s.items = s.items.map((ev) => (ev.id === a.payload.id ? a.payload : ev));
    });
  },
});

export default slice.reducer;
