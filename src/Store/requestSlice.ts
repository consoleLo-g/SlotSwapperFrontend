import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAllSwapRequestsApi, respondSwapRequestApi } from "../api/swapApi";

// Fetch all requests and split into incoming/outgoing on frontend
export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (currentUserId: string) => {
    const allRequests = await getAllSwapRequestsApi();
    const incoming = allRequests.filter((r: any) => r.requestedSlotOwnerId === currentUserId);
    const outgoing = allRequests.filter((r: any) => r.requesterId === currentUserId);
    return { incoming, outgoing };
  }
);

export const respondRequest = createAsyncThunk(
  "requests/respond",
  async (payload: { id: string; accept: boolean }) => {
    const res = await respondSwapRequestApi(payload);
    return res.data;
  }
);

const slice = createSlice({
  name: "requests",
  initialState: { incoming: [] as any[], outgoing: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRequests.pending, (s) => { s.loading = true; });
    builder.addCase(fetchRequests.fulfilled, (s, a) => {
      s.incoming = a.payload.incoming;
      s.outgoing = a.payload.outgoing;
      s.loading = false;
    });
    builder.addCase(fetchRequests.rejected, (s) => { s.loading = false; });

    builder.addCase(respondRequest.fulfilled, (s) => {
      // after responding, frontend can re-fetch lists
    });
  },
});

export default slice.reducer;
