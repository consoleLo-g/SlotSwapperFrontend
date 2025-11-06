import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllEventsApi,
  getUserEventsApi,
  makeEventSwappableApi,
  createSwapRequestApi,
  respondSwapRequestApi,
  getAllSwapRequestsApi
} from "../api/swapApi";
import { fetchUserById } from "../api/userApi";
import type { AppEvent } from "../Types/Event";

// ---------------------- UTILITY FUNCTIONS ----------------------
const normalizeEvent = (ev: any): AppEvent => ({
  ...ev,
  date: ev.date || ev.start?.split("T")[0] || "",
  startTime: ev.startTime || ev.start?.split("T")[1]?.substring(0,5) || "",
  endTime: ev.endTime || ev.end?.split("T")[1]?.substring(0,5) || ""
});

const attachUsernames = async (events: any[]) => {
  const cache: Record<string, string> = {};
  return Promise.all(
    events.map(async (ev) => {
      if (!cache[ev.userId]) {
        try {
          const res = await fetchUserById(ev.userId);
          cache[ev.userId] = res.data?.name || "Unknown User";
        } catch {
          cache[ev.userId] = "Unknown User";
        }
      }
      return { ...normalizeEvent(ev), userName: cache[ev.userId] };
    })
  );
};

// ---------------------- THUNKS ----------------------

// Fetch marketplace events
export const fetchMarketplace = createAsyncThunk(
  "swap/fetchMarketplace",
  async (currentUserId: string) => {
    const allEvents = await getAllEventsApi();
    const swappable = allEvents.filter(
      (ev: any) => ev.swappable && ev.userId !== currentUserId
    );
    return await attachUsernames(swappable);
  }
);

// Fetch my events
export const fetchMyEvents = createAsyncThunk("swap/fetchMyEvents", async (userId: string) => {
  const events = await getUserEventsApi(userId);
  return await attachUsernames(events);
});

// Make an event swappable
export const makeEventSwappable = createAsyncThunk("swap/makeSwappable", async (id: string) => {
  const ev = await makeEventSwappableApi(id);
  return normalizeEvent(ev);
});

// Create a swap request
export const createSwapRequest = createAsyncThunk(
  "swap/createRequest",
  async (payload: { requesterId: string; eventId: string; requestedSlot: string; offeredSlot: string }) => {
    return await createSwapRequestApi(payload);
  }
);

// Fetch swap requests
export const fetchSwapRequests = createAsyncThunk(
  "swap/fetchRequests",
  async (currentUserId: string) => {
    const allRequests = await getAllSwapRequestsApi();

    const incomingRaw = allRequests.filter((r: any) => r.requestedSlotOwnerId === currentUserId);
    const outgoingRaw = allRequests.filter((r: any) => r.requesterId === currentUserId);

    // Attach usernames to requesterId and requestedSlotOwnerId
    const cache: Record<string, string> = {};
    const enrich = async (arr: any[], key: string) =>
      Promise.all(arr.map(async (r) => {
        const id = r[key];
        if (!cache[id]) {
          try {
            const res = await fetchUserById(id);
            cache[id] = res.data?.name || "Unknown User";
          } catch {
            cache[id] = "Unknown User";
          }
        }
        return { ...r, [`${key}Name`]: cache[id] };
      }));

    return {
      incoming: await enrich(incomingRaw, "requesterId"),
      outgoing: await enrich(outgoingRaw, "requestedSlotOwnerId")
    };
  }
);

// Respond to swap request
export const respondSwapRequest = createAsyncThunk(
  "swap/respondRequest",
  async (payload: { id: string; accept: boolean }) => {
    return await respondSwapRequestApi(payload);
  }
);

// ---------------------- SLICE ----------------------
interface SwapState {
  marketplace: AppEvent[];
  myEvents: AppEvent[];
  loading: boolean;
  incoming: any[];
  outgoing: any[];
}

const slice = createSlice({
  name: "swap",
  initialState: { marketplace: [], myEvents: [], loading: false, incoming: [], outgoing: [] } as SwapState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Marketplace
      .addCase(fetchMarketplace.pending, (s) => { s.loading = true; })
      .addCase(fetchMarketplace.fulfilled, (s, a) => { s.marketplace = a.payload; s.loading = false; })
      .addCase(fetchMarketplace.rejected, (s) => { s.loading = false; })

      // My events
      .addCase(fetchMyEvents.fulfilled, (s, a) => { s.myEvents = a.payload; })

      // Make swappable
      .addCase(makeEventSwappable.fulfilled, (s, a) => {
        s.myEvents = s.myEvents.map(ev => ev.id === a.payload.id ? a.payload : ev);
      })

      // Swap requests
      .addCase(fetchSwapRequests.fulfilled, (s, a) => { s.incoming = a.payload.incoming; s.outgoing = a.payload.outgoing; });
  }
});

export default slice.reducer;
