import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAllEventsApi,
  getUserEventsApi,
  makeEventSwappableApi,
  createSwapRequestApi,
  respondSwapRequestApi,
  getAllSwapRequestsApi
} from "../api/swapApi";

export const fetchMarketplace = createAsyncThunk("swap/fetchMarketplace", async (currentUserId: string) => {
  const allEvents = await getAllEventsApi();
  // Only swappable events and not your own
  return allEvents.filter((ev: any) => ev.swappable && ev.userId !== currentUserId);
});

export const fetchMyEvents = createAsyncThunk("swap/fetchMyEvents", async (userId: string) => {
  return await getUserEventsApi(userId);
});

export const makeEventSwappable = createAsyncThunk("swap/makeSwappable", async (id: string) => {
  return await makeEventSwappableApi(id);
});

export const createSwapRequest = createAsyncThunk("swap/createRequest", async (payload: {
  requesterId: string;
  eventId: string;
  requestedSlot: string;
  offeredSlot: string;
}) => {
  return await createSwapRequestApi(payload);
});

export const fetchSwapRequests = createAsyncThunk("swap/fetchRequests", async (currentUserId: string) => {
  const allRequests = await getAllSwapRequestsApi();
  const incoming = allRequests.filter((r: any) => r.requestedSlotOwnerId === currentUserId);
  const outgoing = allRequests.filter((r: any) => r.requesterId === currentUserId);
  return { incoming, outgoing };
});

export const respondSwapRequest = createAsyncThunk("swap/respondRequest", async (payload: { id: string; accept: boolean }) => {
  return await respondSwapRequestApi(payload);
});

interface SwapState {
  marketplace: any[];
  myEvents: any[];
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
      .addCase(fetchMarketplace.pending, (s) => { s.loading = true; })
      .addCase(fetchMarketplace.fulfilled, (s, a) => { s.marketplace = a.payload; s.loading = false; })
      .addCase(fetchMarketplace.rejected, (s) => { s.loading = false; })

      .addCase(fetchMyEvents.fulfilled, (s, a) => { s.myEvents = a.payload; })
      
      .addCase(fetchSwapRequests.fulfilled, (s, a) => { s.incoming = a.payload.incoming; s.outgoing = a.payload.outgoing; });
  }
});

export default slice.reducer;
