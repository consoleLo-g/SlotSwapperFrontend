import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllEventsApi,
  getUserEventsApi,
  makeEventSwappableApi,
  createSwapRequestApi,
  respondSwapRequestApi,
  getAllSwapRequestsApi,
  type CreateSwapRequestDTO
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
    const res: any = await getAllEventsApi();

    // Support both axios and raw array
    const rawEvents: any[] = Array.isArray(res) ? res : res?.data ?? [];

    const now = new Date();

    const normalize = (ev: any) => {
      const id = ev._id ?? ev.id;

      const date = ev.date || (ev.start?.split("T")[0] ?? "");
      const startTime = ev.startTime || ev.start?.split("T")[1]?.substring(0, 5) || "";
      const endTime = ev.endTime || ev.end?.split("T")[1]?.substring(0, 5) || "";

      const isoStart = ev.start || (date && startTime ? `${date}T${startTime}` : null);
      const startObj = isoStart ? new Date(isoStart) : null;

      return {
        ...ev,
        id,
        swappable: !!ev.swappable,
        date,
        startTime,
        endTime,
        start: isoStart,
        _startObj: startObj,
      };
    };

    const isFutureOrTodaySlot = (ev: any) => {
      if (!ev._startObj || isNaN(ev._startObj.getTime())) return false;

      const eventDate = new Date(ev.date);
      const today = new Date(now.toDateString()); // zero-out time

      // Future date → show
      if (eventDate > today) return true;

      // Today → only show if start time is still upcoming
      if (eventDate.getTime() === today.getTime()) {
        return ev._startObj >= now;
      }

      // Past date → hide
      return false;
    };

    // ✅ FILTER
    const candidate = rawEvents
      .map(normalize)
      .filter((ev: any) => {
        if (!ev.swappable) return false;
        if (String(ev.userId) === String(currentUserId)) return false;
        if (!isFutureOrTodaySlot(ev)) return false;
        return true;
      });

    // ✅ Attach usernames
    const cache: Record<string, string> = {};
    const enriched = await Promise.all(
      candidate.map(async (ev) => {
        if (!cache[ev.userId]) {
          try {
            const r = await fetchUserById(ev.userId);
            cache[ev.userId] = r.data?.name ?? "Unknown User";
          } catch {
            cache[ev.userId] = "Unknown User";
          }
        }

        const { _startObj, ...cleaned } = ev;
        return { ...cleaned, userName: cache[ev.userId] };
      })
    );
    return enriched as AppEvent[];
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
  async (payload: CreateSwapRequestDTO) => {
    return await createSwapRequestApi(payload);
  }
);

// Fetch swap requests
export const fetchSwapRequests = createAsyncThunk(
  "swap/fetchRequests",
  async (currentUserId: string) => {
    const requests = await getAllSwapRequestsApi();

    // incoming = requests where *requestedSlot belongs to me*
    const incomingRaw = requests.filter((r: any) =>
      r.requestedSlotOwnerId === currentUserId
    );

    // outgoing = requests I created
    const outgoingRaw = requests.filter((r: any) =>
      r.requesterId === currentUserId
    );

    const cache: Record<string, string> = {};

    const enrich = async (arr: any[], userKey: string) =>
      Promise.all(
        arr.map(async (req) => {
          const uid = req[userKey];
          if (!cache[uid]) {
            try {
              const resp = await fetchUserById(uid);
              cache[uid] = resp.data?.name || "Unknown User";
            } catch {
              cache[uid] = "Unknown User";
            }
          }
          return { ...req, [`${userKey}Name`]: cache[uid] };
        })
      );

    return {
      incoming: await enrich(incomingRaw, "requesterId"),
      outgoing: await enrich(outgoingRaw, "requesterId")
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
